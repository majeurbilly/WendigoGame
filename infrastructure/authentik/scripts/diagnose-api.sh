#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."

if [[ -f .env ]]; then
  set -a
  # shellcheck disable=SC1091
  source .env
  set +a
fi
unset AUTHENTIK_TOKEN AUTHENTIK_URL

URL="http://localhost:9000"
TOKEN=""
if command -v pulumi >/dev/null 2>&1; then
  URL="$(pulumi config get authentik:url 2>/dev/null || echo "$URL")"
  TOKEN="$(pulumi config get authentik:token 2>/dev/null || true)"
fi

echo "=== Authentik API diagnostic ==="
echo "URL: $URL"
echo "TOKEN set: $([ -n "$TOKEN" ] && echo yes || echo NO)"

echo -n "Health: "
curl -s -o /dev/null -w "%{http_code}\n" "$URL/-/health/live/"

if [[ -z "$TOKEN" ]]; then
  echo "ERROR: AUTHENTIK_TOKEN not set (.env or env)"
  exit 1
fi

check() {
  local label="$1"
  local path="$2"
  local code
  code=$(curl -s -o /tmp/ak-diag.json -w "%{http_code}" \
    -H "Authorization: Bearer $TOKEN" \
    "$URL$path")
  echo "[$code] $label"
  if [[ "$code" != "200" ]]; then
    head -c 300 /tmp/ak-diag.json 2>/dev/null || true
    echo
  fi
}

check "flow default-authentication-flow" \
  "/api/v3/flows/instances/?slug=default-authentication-flow"
check "flow default-provider-authorization-implicit-consent" \
  "/api/v3/flows/instances/?slug=default-provider-authorization-implicit-consent"
check "flow default-provider-invalidation-flow" \
  "/api/v3/flows/instances/?slug=default-provider-invalidation-flow"
check "flow default-source-authentication" \
  "/api/v3/flows/instances/?slug=default-source-authentication"
check "certificate authentik Self-signed Certificate" \
  "/api/v3/crypto/certificatekeypairs/?name=authentik%20Self-signed%20Certificate"
check "managed oauth scopes" \
  "/api/v3/propertymappings/provider/scope/?managed__icontains=goauthentik.io/providers/oauth2"
