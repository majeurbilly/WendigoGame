#!/usr/bin/env bash
# Passe 2 : property mappings OIDC via API (évite EOF du plugin sur PATCH ProviderOauth2).
set -euo pipefail
cd "$(dirname "$0")/.."

URL="${AUTHENTIK_URL:-http://localhost:9000}"
TOKEN="${AUTHENTIK_API_TOKEN:-}"
PROVIDER_PK="${WENDIGO_OIDC_PROVIDER_PK:-1}"

if [[ -z "$TOKEN" ]]; then
  echo "export AUTHENTIK_API_TOKEN='<clé API>'"
  exit 1
fi

echo "=== Property mappings OIDC (scopes managés + profil Wendigo) ==="
BODY="$(python3 - "$URL" "$TOKEN" "$PROVIDER_PK" <<'PY'
import json
import sys
import urllib.request

url, token, provider_pk = sys.argv[1], sys.argv[2], sys.argv[3]

def get(path: str) -> dict:
    req = urllib.request.Request(
        f"{url.rstrip('/')}{path}",
        headers={"Authorization": f"Bearer {token}", "Accept": "application/json"},
    )
    with urllib.request.urlopen(req, timeout=60) as resp:
        return json.load(resp)

managed = get(
    "/api/v3/propertymappings/provider/scope/"
    "?managed__icontains=goauthentik.io/providers/oauth2"
)
profile = get(
    "/api/v3/propertymappings/provider/scope/"
    "?search=Wendigo%20%E2%80%94%20OpenID%20profile"
)

ids = [r["pk"] for r in managed.get("results", [])]
if profile.get("results"):
    ids.append(profile["results"][0]["pk"])

if not ids:
    raise SystemExit("Aucun property mapping trouvé")

print(
    json.dumps(
        {
            "property_mappings": ids,
            "include_claims_in_id_token": True,
            "access_token_validity": "minutes=15",
            "refresh_token_validity": "days=30",
        }
    )
)
PY
)"

HTTP="$(curl -sS -o /tmp/oidc-patch.json -w "%{http_code}" \
  -X PATCH -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d "$BODY" \
  "$URL/api/v3/providers/oauth2/${PROVIDER_PK}/")"

echo "PATCH providers/oauth2/${PROVIDER_PK} → HTTP $HTTP"
if [[ "$HTTP" != "200" ]]; then
  head -c 800 /tmp/oidc-patch.json
  echo
  exit 1
fi
echo "OK — scopes OIDC appliqués."
