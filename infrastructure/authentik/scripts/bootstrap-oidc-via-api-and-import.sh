#!/usr/bin/env bash
# Crée le provider OIDC Wendigo + l'application via l'API REST, puis les importe dans Pulumi.
# Contourne « error reading from server: EOF » du plugin Terraform sur ProviderOauth2 (~36s).
set -euo pipefail
cd "$(dirname "$0")/.."

export PATH="/nix/store/fsqymqpb5s5nv99irpkwjmwc7pf7mxkk-pulumi-3.192.0/bin:/nix/store/h9vi02a41py0x0gmibn116lqnyqxb2zl-pulumi-nodejs-3.192.0/bin:${PATH:-}"
export PULUMI_CONFIG_PASSPHRASE="${PULUMI_CONFIG_PASSPHRASE:-}"

URL="${AUTHENTIK_URL:-http://localhost:9000}"
TOKEN="${AUTHENTIK_API_TOKEN:-}"
CLIENT_ID="${WENDIGO_OIDC_CLIENT_ID:-wendigo-dev}"
APP_SLUG="${WENDIGO_APP_SLUG:-wendigo}"
PROVIDER_NAME="${WENDIGO_OIDC_NAME:-Wendigo}"

if [[ -z "$TOKEN" ]]; then
  echo "export AUTHENTIK_API_TOKEN='<clé API>'"
  exit 1
fi

bash "$(dirname "$0")/sync-pulumi-authentik-token.sh"
export AUTHENTIK_TOKEN="${AUTHENTIK_API_TOKEN}"
export AUTHENTIK_URL="${AUTHENTIK_URL:-http://localhost:9000}"

api() {
  curl -sS -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" "$@"
}

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

echo "=== Références système ==="
FLOW_IDS="$(python3 "$SCRIPT_DIR/lib/resolve-flows.py" "$URL" "$TOKEN" \
  default-provider-authorization-implicit-consent \
  default-provider-invalidation-flow \
  wendigo-authentication)"
AUTH_FLOW="$(echo "$FLOW_IDS" | sed -n '1p')"
INVALID_FLOW="$(echo "$FLOW_IDS" | sed -n '2p')"
WENDIGO_AUTH="$(echo "$FLOW_IDS" | sed -n '3p')"

CERT="$(api "$URL/api/v3/crypto/certificatekeypairs/?name=authentik%20Self-signed%20Certificate" \
  | python3 -c "import sys,json; r=json.load(sys.stdin)['results']; assert r, 'certificat introuvable'; print(r[0]['pk'])")"

if [[ -z "$AUTH_FLOW" || -z "$INVALID_FLOW" || -z "$WENDIGO_AUTH" ]]; then
  echo "ERREUR: impossible de résoudre les flux OIDC."
  exit 1
fi

echo "authorization=$AUTH_FLOW invalidation=$INVALID_FLOW wendigo_auth=$WENDIGO_AUTH cert=$CERT"

echo "=== Provider OAuth2 existant (client_id=$CLIENT_ID) ==="
EXISTING_JSON="$(api "$URL/api/v3/providers/oauth2/?client_id=$CLIENT_ID")"
PROVIDER_PK="$(echo "$EXISTING_JSON" | python3 -c "
import sys, json
r = json.load(sys.stdin).get('results') or []
print(r[0]['pk'] if r else '')
" 2>/dev/null || true)"

if [[ -n "$PROVIDER_PK" ]]; then
  echo "Provider existant pk=$PROVIDER_PK — réutilisation"
else
  echo "=== POST provider OAuth2 minimal ==="
  BODY="$(python3 - <<PY
import json
print(json.dumps({
  "name": "$PROVIDER_NAME",
  "client_type": "public",
  "client_id": "$CLIENT_ID",
  "authorization_flow": "$AUTH_FLOW",
  "invalidation_flow": "$INVALID_FLOW",
  "authentication_flow": "$WENDIGO_AUTH",
  "signing_key": "$CERT",
  "issuer_mode": "per_provider",
  "sub_mode": "user_uuid",
  "redirect_uris": [
    {"matching_mode": "strict", "url": "http://localhost:5173/"},
    {"matching_mode": "strict", "url": "http://localhost:5173/login"},
  ],
}))
PY
)"
  HTTP="$(curl -sS -o /tmp/wendigo-oidc-post.json -w "%{http_code}" \
    -X POST -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
    -d "$BODY" "$URL/api/v3/providers/oauth2/")"
  echo "POST providers/oauth2 → HTTP $HTTP"
  if [[ "$HTTP" != "201" ]]; then
    head -c 800 /tmp/wendigo-oidc-post.json
    echo
    exit 1
  fi
  PROVIDER_PK="$(python3 -c "import json; print(json.load(open('/tmp/wendigo-oidc-post.json'))['pk'])")"
  echo "Provider créé pk=$PROVIDER_PK"
fi

echo "=== Application (slug=$APP_SLUG) ==="
APP_JSON="$(api "$URL/api/v3/core/applications/?slug=$APP_SLUG")"
APP_EXISTS="$(echo "$APP_JSON" | python3 -c "import sys,json; print('yes' if json.load(sys.stdin).get('results') else '')")"

if [[ -z "$APP_EXISTS" ]]; then
  APP_BODY="$(python3 - <<PY
import json
print(json.dumps({
  "name": "$PROVIDER_NAME",
  "slug": "$APP_SLUG",
  "provider": int("$PROVIDER_PK"),
  "meta_launch_url": "http://localhost:5173/",
  "meta_publisher": "Wendigo Game",
}))
PY
)"
  HTTP="$(curl -sS -o /tmp/wendigo-app-post.json -w "%{http_code}" \
    -X POST -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
    -d "$APP_BODY" "$URL/api/v3/core/applications/")"
  echo "POST applications → HTTP $HTTP"
  if [[ "$HTTP" != "201" ]]; then
    head -c 800 /tmp/wendigo-app-post.json
    echo
    exit 1
  fi
else
  echo "Application déjà présente"
fi

import_if_missing() {
  local type="$1" name="$2" id="$3"
  if pulumi stack export 2>/dev/null | grep -q "\"urn\".*::${name}\""; then
    echo "Déjà dans l'état Pulumi : $name"
    return 0
  fi
  echo "pulumi import $type $name $id"
  # AUTHENTIK_TOKEN doit être défini (sync-pulumi-authentik-token.sh)
  pulumi import --yes "$type" "$name" "$id"
}

echo "=== Import Pulumi (si absent de l'état) ==="
import_if_missing 'authentik:index/providerOauth2:ProviderOauth2' wendigo-oidc "$PROVIDER_PK"

echo "=== Retrait protect (import Pulumi) ==="
pulumi state unprotect \
  "urn:pulumi:dev::wendigo-authentik::authentik:index/providerOauth2:ProviderOauth2::wendigo-oidc" \
  2>/dev/null || true

# Application : gérée via API uniquement (évite applicationId invalide à l'import)
if pulumi stack export 2>/dev/null | grep -q '::wendigo-app'; then
  bash "$(dirname "$0")/fix-wendigo-app-state.sh"
fi

echo "=== Terminé — pulumi up --exclude wendigo-oidc ==="
