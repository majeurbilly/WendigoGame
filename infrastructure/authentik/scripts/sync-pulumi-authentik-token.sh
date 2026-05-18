#!/usr/bin/env bash
# Aligne Pulumi config + variables d'environnement pour le provider Authentik.
set -euo pipefail
cd "$(dirname "$0")/.."

export PATH="/nix/store/fsqymqpb5s5nv99irpkwjmwc7pf7mxkk-pulumi-3.192.0/bin:/nix/store/h9vi02a41py0x0gmibn116lqnyqxb2zl-pulumi-nodejs-3.192.0/bin:${PATH:-}"
export PULUMI_CONFIG_PASSPHRASE="${PULUMI_CONFIG_PASSPHRASE:-}"

TOKEN="${AUTHENTIK_API_TOKEN:-}"
URL="${AUTHENTIK_URL:-http://localhost:9000}"

if [[ -z "$TOKEN" ]]; then
  echo "export AUTHENTIK_API_TOKEN='<clé API>'"
  exit 1
fi

echo "=== Pulumi config + env (AUTHENTIK_TOKEN) ==="
pulumi config set --secret authentik:token "$TOKEN"
pulumi config set authentik:url "$URL"

export AUTHENTIK_API_TOKEN="$TOKEN"
export AUTHENTIK_TOKEN="$TOKEN"
export AUTHENTIK_URL="$URL"

echo "=== Vérification token API ==="
CODE="$(curl -s -o /tmp/pulumi-ak-token-test.json -w "%{http_code}" \
  -H "Authorization: Bearer $TOKEN" \
  "${URL%/}/api/v3/providers/oauth2/?page_size=1")"
echo "GET providers/oauth2 → HTTP $CODE"
if [[ "$CODE" != "200" ]]; then
  cat /tmp/pulumi-ak-token-test.json
  exit 1
fi

echo "=== Plugins Pulumi (aligner authentik 2025.12.1) ==="
pulumi install 2>/dev/null || true
