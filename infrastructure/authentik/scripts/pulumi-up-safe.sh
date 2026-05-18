#!/usr/bin/env bash
# Déploiement séquentiel + retry — limite les EOF sur ProviderOauth2 (charge API Authentik).
set -euo pipefail
cd "$(dirname "$0")/.."

unset AUTHENTIK_TOKEN AUTHENTIK_URL

# Évite les updates fantômes StageUserLogin / SourceOauth à chaque run
export PULUMI_SKIP_UPDATE_CHECK="${PULUMI_SKIP_UPDATE_CHECK:-false}"

MAX_ATTEMPTS="${1:-3}"
attempt=1

while [[ "$attempt" -le "$MAX_ATTEMPTS" ]]; do
  echo "=== pulumi up (tentative $attempt/$MAX_ATTEMPTS, --parallel 1) ==="
  if pulumi up --parallel 1 --yes; then
    echo "=== Déploiement réussi ==="
    exit 0
  fi
  echo "=== Échec — pause 15s avant retry ==="
  sleep 15
  attempt=$((attempt + 1))
done

echo "=== Échec après $MAX_ATTEMPTS tentatives ==="
echo "Vérifiez Admin Authentik → Applications → Providers (doublon « Wendigo ») :"
echo "  bash scripts/check-oidc-provider.sh"
exit 1
