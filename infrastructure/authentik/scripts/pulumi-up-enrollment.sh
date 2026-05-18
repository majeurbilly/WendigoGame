#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."

export PATH="/nix/store/fsqymqpb5s5nv99irpkwjmwc7pf7mxkk-pulumi-3.192.0/bin:/nix/store/h9vi02a41py0x0gmibn116lqnyqxb2zl-pulumi-nodejs-3.192.0/bin:${PATH:-}"
export PULUMI_CONFIG_PASSPHRASE=""
export PULUMI_DISABLE_GRPC_C_CHECKS=true

set -a
# shellcheck source=/dev/null
[[ -f .env ]] && source .env
set +a

export AUTHENTIK_API_TOKEN="${AUTHENTIK_API_TOKEN:-${AUTHENTIK_TOKEN:-}}"
export AUTHENTIK_TOKEN="$AUTHENTIK_API_TOKEN"

if [[ -z "$AUTHENTIK_API_TOKEN" ]]; then
  echo "export AUTHENTIK_API_TOKEN='...'"
  exit 1
fi

npm run build

OIDC_URN="urn:pulumi:dev::wendigo-authentik::authentik:index/providerOauth2:ProviderOauth2::wendigo-oidc"
exec pulumi up --yes --parallel 1 --exclude "$OIDC_URN"
