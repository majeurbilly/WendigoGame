#!/usr/bin/env bash
# Retire wendigo-app de l'état Pulumi (import avec protect + applicationId invalide).
set -euo pipefail
cd "$(dirname "$0")/.."

export PATH="/nix/store/fsqymqpb5s5nv99irpkwjmwc7pf7mxkk-pulumi-3.192.0/bin:${PATH:-}"
export PULUMI_CONFIG_PASSPHRASE="${PULUMI_CONFIG_PASSPHRASE:-}"

URN="urn:pulumi:dev::wendigo-authentik::authentik:index/application:Application::wendigo-app"

if ! pulumi stack export 2>/dev/null | grep -q '::wendigo-app'; then
  echo "wendigo-app absent de l'état — rien à faire."
  exit 0
fi

echo "=== Déprotection wendigo-app ==="
pulumi state unprotect "$URN"

echo "=== Suppression de l'état (l'app reste dans Authentik, slug wendigo) ==="
pulumi state delete --yes --force "$URN"

echo "OK — relancez : pulumi up --yes --parallel 1 --exclude <OIDC_URN>"
