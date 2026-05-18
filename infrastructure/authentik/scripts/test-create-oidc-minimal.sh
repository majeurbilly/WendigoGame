#!/usr/bin/env bash
# Teste la création OIDC via l'API REST (hors Pulumi) pour isoler EOF du plugin Terraform.
set -euo pipefail
cd "$(dirname "$0")/.."

URL="${AUTHENTIK_URL:-http://localhost:9000}"
TOKEN="${AUTHENTIK_API_TOKEN:-}"

if [[ -z "$TOKEN" ]]; then
  echo "export AUTHENTIK_API_TOKEN='ak-...'"
  exit 1
fi

echo "=== Récupération des flux système ==="
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
FLOW_IDS="$(python3 "$SCRIPT_DIR/lib/resolve-flows.py" "$URL" "$TOKEN" \
  default-provider-authorization-implicit-consent \
  default-provider-invalidation-flow \
  wendigo-authentication)"
AUTH_FLOW="$(echo "$FLOW_IDS" | sed -n '1p')"
INVALID_FLOW="$(echo "$FLOW_IDS" | sed -n '2p')"
WENDIGO_AUTH="$(echo "$FLOW_IDS" | sed -n '3p')"
CERT=$(curl -s -H "Authorization: Bearer $TOKEN" \
  "$URL/api/v3/crypto/certificatekeypairs/?name=authentik%20Self-signed%20Certificate" \
  | python3 -c "import sys,json; r=json.load(sys.stdin); print(r['results'][0]['pk'])")

echo "authorization=$AUTH_FLOW invalidation=$INVALID_FLOW wendigo_auth=$WENDIGO_AUTH cert=$CERT"

BODY=$(cat <<EOF
{
  "name": "Wendigo-test-api",
  "client_type": "public",
  "client_id": "wendigo-dev-test-$(date +%s)",
  "authorization_flow": "$AUTH_FLOW",
  "invalidation_flow": "$INVALID_FLOW",
  "authentication_flow": "$WENDIGO_AUTH",
  "signing_key": "$CERT",
  "redirect_uris": "http://localhost:5173/",
  "redirect_uris_mode": "strict"
}
EOF
)

echo "=== POST /api/v3/providers/oauth2/ (minimal, sans property_mappings) ==="
HTTP=$(curl -s -o /tmp/oidc-create.json -w "%{http_code}" \
  -X POST -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "$BODY" \
  "$URL/api/v3/providers/oauth2/")

echo "HTTP $HTTP"
head -c 500 /tmp/oidc-create.json
echo
if [[ "$HTTP" == "201" ]]; then
  echo "OK — l'API Authentik accepte la création. Le EOF vient probablement du plugin Pulumi/Terraform."
else
  echo "Échec API — corrigez cette erreur avant pulumi up."
fi
