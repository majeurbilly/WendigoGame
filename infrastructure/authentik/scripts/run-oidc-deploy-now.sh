#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."

export PATH="/nix/store/fsqymqpb5s5nv99irpkwjmwc7pf7mxkk-pulumi-3.192.0/bin:/nix/store/h9vi02a41py0x0gmibn116lqnyqxb2zl-pulumi-nodejs-3.192.0/bin:${PATH:-}"
export PULUMI_CONFIG_PASSPHRASE=""
export PULUMI_DISABLE_GRPC_C_CHECKS=true

LOG_DIR="$(pwd)/.pulumi-deploy-logs"
mkdir -p "$LOG_DIR"

if [[ -z "${AUTHENTIK_API_TOKEN:-}" ]]; then
  echo "ERREUR: export AUTHENTIK_API_TOKEN='<clé API>' avant ce script"
  exit 1
fi
bash scripts/sync-pulumi-authentik-token.sh
export AUTHENTIK_TOKEN="${AUTHENTIK_API_TOKEN}"
export AUTHENTIK_URL="${AUTHENTIK_URL:-http://localhost:9000}"

echo "=== Vérification token API ==="
AK_URL="${AUTHENTIK_URL:-http://localhost:9000}"
for path in "/api/v3/core/users/me/" "/api/v3/flows/instances/?slug=default-authentication-flow"; do
  CODE=$(curl -s -o /tmp/ak-token-test.json -w "%{http_code}" \
    -H "Authorization: Bearer $AUTHENTIK_API_TOKEN" \
    "$AK_URL$path")
  echo "$path → HTTP $CODE"
  [[ "$CODE" == "200" ]] || { cat /tmp/ak-token-test.json; exit 1; }
done

echo "=== Santé Authentik ==="
curl -s -o /dev/null -w "health=%{http_code}\n" "${AK_URL}/-/health/live/" || true

OIDC_URN="urn:pulumi:dev::wendigo-authentik::authentik:index/providerOauth2:ProviderOauth2::wendigo-oidc"

echo "=== Passe 1a : OIDC + app via API + import ==="
bash scripts/bootstrap-oidc-via-api-and-import.sh

echo "=== Passe 1b : Pulumi sync (sans PATCH wendigo-oidc — ignoreChanges) ==="
pulumi config set wendigo:oidcIncludePropertyMappings false
pulumi up --yes --parallel 1 --exclude "$OIDC_URN" 2>&1 | tee "$LOG_DIR/pass1.log"
PASS1=${PIPESTATUS[0]}
echo "=== Passe 1 exit: $PASS1 ==="
[[ "$PASS1" -eq 0 ]] || exit "$PASS1"

echo "=== Passe 2a : property mappings via API ==="
bash scripts/patch-oidc-property-mappings.sh

echo "=== Passe 2b : Pulumi (config alignée, sans toucher wendigo-oidc) ==="
pulumi config set wendigo:oidcIncludePropertyMappings true
pulumi up --yes --parallel 1 --exclude "$OIDC_URN" 2>&1 | tee "$LOG_DIR/pass2.log"
PASS2=${PIPESTATUS[0]}
echo "=== Passe 2 exit: $PASS2 ==="
exit "$PASS2"
