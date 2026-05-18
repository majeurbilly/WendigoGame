#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."

export PATH="/nix/store/fsqymqpb5s5nv99irpkwjmwc7pf7mxkk-pulumi-3.192.0/bin:${PATH:-}"
export PULUMI_CONFIG_PASSPHRASE="${PULUMI_CONFIG_PASSPHRASE:-}"

GOOGLE_ID="${1:-276321618988-c9gn61hqql7fspuva25g9lam4jh25mvg.apps.googleusercontent.com}"
GOOGLE_SECRET="${2:-}"

if [[ -z "$GOOGLE_SECRET" ]]; then
  echo "Usage: $0 <google-client-id> <google-client-secret>"
  exit 1
fi

pulumi config set wendigo:googleClientId "$GOOGLE_ID"
pulumi config set --secret wendigo:googleClientSecret "$GOOGLE_SECRET"
echo "OK — wendigo:googleClientId et googleClientSecret mis à jour."
