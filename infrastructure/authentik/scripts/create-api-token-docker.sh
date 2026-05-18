#!/usr/bin/env bash
# Crée un token API valide via le shell Authentik dans Docker (contourne token UI invalide).
set -euo pipefail
REPO_ROOT="$(cd "$(dirname "$0")/../../.." && pwd)"
IDENTIFIER="${1:-pulumi-dev}"
USER_NAME="${2:-akadmin}"

cd "$REPO_ROOT"

CONTAINER_ID="$(docker compose ps -q authentik-server 2>/dev/null || true)"
if [[ -z "$CONTAINER_ID" ]]; then
  echo "Service authentik-server introuvable. Lancez depuis la racine du repo :"
  echo "  docker compose up -d authentik-server authentik-worker"
  exit 1
fi

if [[ "$(docker inspect -f '{{.State.Running}}' "$CONTAINER_ID")" != "true" ]]; then
  echo "Le conteneur authentik-server n'est pas démarré."
  echo "  docker compose up -d authentik-server authentik-worker"
  exit 1
fi

echo "=== Création token API « $IDENTIFIER » pour $USER_NAME ==="
echo "(recrée le token si l'identifiant existe déjà)"

TOKEN_KEY="$(
  docker compose exec -T authentik-server ak shell -c "
from authentik.core.models import Token, User
user = User.objects.get(username='${USER_NAME}')
Token.objects.filter(identifier='${IDENTIFIER}').delete()
token = Token.objects.create(
    identifier='${IDENTIFIER}',
    user=user,
    intent='api',
    expiring=False,
)
print(token.key)
" 2>/dev/null | tail -n 1
)"

if [[ -z "$TOKEN_KEY" ]] || [[ ${#TOKEN_KEY} -lt 20 ]]; then
  echo "Échec : clé API non générée. Relancez sans 2>/dev/null pour voir l'erreur."
  exit 1
fi

echo
echo "$TOKEN_KEY"
echo
echo "Ensuite (coller la clé telle quelle, avec ou sans préfixe ak-) :"
echo "  export AUTHENTIK_API_TOKEN='<clé ci-dessus>'"
echo "  export PULUMI_CONFIG_PASSPHRASE=\"\""
echo "  unset AUTHENTIK_TOKEN AUTHENTIK_URL"
echo "  cd infrastructure/authentik && bash scripts/run-oidc-deploy-now.sh"
