#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."

export PATH="/nix/store/fsqymqpb5s5nv99irpkwjmwc7pf7mxkk-pulumi-3.192.0/bin:${PATH:-}"

unset AUTHENTIK_TOKEN AUTHENTIK_URL
export PULUMI_DISABLE_GRPC_C_CHECKS=true

if [[ -z "${PULUMI_CONFIG_PASSPHRASE:-}" && -z "${PULUMI_CONFIG_PASSPHRASE_FILE:-}" ]]; then
  if [[ -f .pulumi-passphrase ]]; then
    export PULUMI_CONFIG_PASSPHRASE_FILE="$(pwd)/.pulumi-passphrase"
  else
    echo "ERREUR: exportez PULUMI_CONFIG_PASSPHRASE ou créez infrastructure/authentik/.pulumi-passphrase"
    exit 1
  fi
fi

LOG_DIR="$(pwd)/.pulumi-deploy-logs"
mkdir -p "$LOG_DIR"

echo "=== Nettoyage env OK ==="

pulumi config set wendigo:oidcIncludePropertyMappings false
echo "=== Passe 1 : oidcIncludePropertyMappings=$(pulumi config get wendigo:oidcIncludePropertyMappings) ==="

pulumi up --yes --parallel 1 2>&1 | tee "$LOG_DIR/pass1.log"
PASS1=${PIPESTATUS[0]}
echo "=== Passe 1 exit code: $PASS1 ==="

if [[ "$PASS1" -ne 0 ]]; then
  echo "Échec passe 1 — voir $LOG_DIR/pass1.log"
  exit "$PASS1"
fi

if ! grep -q "wendigo-oidc" "$LOG_DIR/pass1.log" && pulumi stack export | grep -q wendigo-oidc; then
  echo "wendigo-oidc probablement créé (vérif état)"
fi

pulumi config set wendigo:oidcIncludePropertyMappings true
echo "=== Passe 2 : oidcIncludePropertyMappings=$(pulumi config get wendigo:oidcIncludePropertyMappings) ==="

pulumi up --yes --parallel 1 2>&1 | tee "$LOG_DIR/pass2.log"
PASS2=${PIPESTATUS[0]}
echo "=== Passe 2 exit code: $PASS2 ==="

exit "$PASS2"
