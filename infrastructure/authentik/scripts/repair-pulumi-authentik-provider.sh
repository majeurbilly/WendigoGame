#!/usr/bin/env bash
# Migre les ressources vers le provider Authentik implicite (AUTHENTIK_TOKEN), puis supprime l'ancien provider 1.1.0.
set -euo pipefail
cd "$(dirname "$0")/.."

export PATH="/nix/store/fsqymqpb5s5nv99irpkwjmwc7pf7mxkk-pulumi-3.192.0/bin:/nix/store/h9vi02a41py0x0gmibn116lqnyqxb2zl-pulumi-nodejs-3.192.0/bin:${PATH:-}"
export PULUMI_CONFIG_PASSPHRASE="${PULUMI_CONFIG_PASSPHRASE:-}"

bash "$(dirname "$0")/sync-pulumi-authentik-token.sh"
export AUTHENTIK_TOKEN="${AUTHENTIK_API_TOKEN}"
export AUTHENTIK_URL="${AUTHENTIK_URL:-http://localhost:9000}"

echo "=== Migration : provider implicite (AUTHENTIK_TOKEN) ==="
pulumi up --yes --parallel 1

PROVIDER_URN="$(pulumi stack export | python3 -c "
import sys, json
for r in json.load(sys.stdin).get('deployment', {}).get('resources', []):
    u = r.get('urn', '')
    if u.endswith('::wendigo-authentik') and 'pulumi:providers:authentik' in u:
        print(u)
        break
" 2>/dev/null || true)"

if [[ -n "$PROVIDER_URN" ]]; then
  echo "=== Suppression provider explicite orphelin ==="
  pulumi state delete --yes "$PROVIDER_URN" || echo "(ignoré si encore référencé)"
fi

echo "OK — relancez : bash scripts/run-oidc-deploy-now.sh"
