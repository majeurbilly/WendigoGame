#!/usr/bin/env bash
# Liste les providers OAuth2 Wendigo / wendigo-dev (orphelins après EOF Pulumi).
set -euo pipefail
cd "$(dirname "$0")/.."

URL="${AUTHENTIK_URL:-http://localhost:9000}"
TOKEN="${AUTHENTIK_API_TOKEN:-}"

if [[ -z "$TOKEN" ]]; then
  echo "Exportez le token API : export AUTHENTIK_API_TOKEN='ak-...'"
  echo "(Admin → Directory → Tokens, intention API)"
  exit 1
fi

echo "=== Providers OAuth2 (recherche « Wendigo ») ==="
curl -s -H "Authorization: Bearer $TOKEN" \
  "$URL/api/v3/providers/oauth2/?search=Wendigo" | python3 -m json.tool 2>/dev/null || \
  curl -s -H "Authorization: Bearer $TOKEN" \
  "$URL/api/v3/providers/oauth2/?search=Wendigo"
echo

echo "=== Par client_id « wendigo-dev » ==="
curl -s -H "Authorization: Bearer $TOKEN" \
  "$URL/api/v3/providers/oauth2/?client_id=wendigo-dev" | python3 -m json.tool 2>/dev/null || true
echo
echo "Si un provider existe sans état Pulumi :"
echo "  pulumi import 'authentik:index/providerOauth2:ProviderOauth2' wendigo-oidc <pk>"
echo "Ou supprimez-le dans l'admin puis relancez pulumi up."
