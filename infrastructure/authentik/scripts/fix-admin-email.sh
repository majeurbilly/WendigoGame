#!/usr/bin/env bash
# Libère l'email du super-admin akadmin pour permettre l'inscription Google (email_link).
set -euo pipefail

URL="${AUTHENTIK_URL:-http://localhost:9000}"
TOKEN="${AUTHENTIK_API_TOKEN:-}"
NEW_ADMIN_EMAIL="${WENDIGO_AKADMIN_EMAIL:-admin@wendigo.local}"

if [[ -z "$TOKEN" ]]; then
  echo "export AUTHENTIK_API_TOKEN='<clé API>'"
  exit 1
fi

api() {
  curl -sS -G -H "Authorization: Bearer $TOKEN" -H "Accept: application/json" "$@"
}

patch_user_email() {
  local pk="$1" email="$2" label="$3"
  local http
  http="$(curl -sS -o /tmp/ak-patch-user.json -w "%{http_code}" \
    -X PATCH -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
    -d "{\"email\": \"$email\"}" \
    "$URL/api/v3/core/users/${pk}/")"
  echo "  PATCH $label (pk=$pk) → $email — HTTP $http"
  if [[ "$http" != "200" ]]; then
    cat /tmp/ak-patch-user.json
    return 1
  fi
}

echo "=== Utilisateur akadmin ==="
AKADMIN_JSON="$(api "$URL/api/v3/core/users/" --data-urlencode "username=akadmin")"
read -r AKADMIN_PK OLD_EMAIL <<<"$(echo "$AKADMIN_JSON" | python3 -c "
import sys, json
r = json.load(sys.stdin).get('results') or []
if not r:
    raise SystemExit('akadmin introuvable')
u = r[0]
print(u['pk'], u.get('email') or '')
")"
echo "pk=$AKADMIN_PK email_actuel=$OLD_EMAIL"

echo "=== PATCH akadmin → $NEW_ADMIN_EMAIL ==="
patch_user_email "$AKADMIN_PK" "$NEW_ADMIN_EMAIL" "akadmin"

if [[ -n "$OLD_EMAIL" && "$OLD_EMAIL" != "$NEW_ADMIN_EMAIL" ]]; then
  echo "=== Autres utilisateurs avec email=$OLD_EMAIL ==="
  CONFLICTS_JSON="$(api "$URL/api/v3/core/users/" --data-urlencode "email=$OLD_EMAIL")"
  while IFS=$'\t' read -r pk username _; do
    [[ -z "$pk" ]] && continue
    local_email="conflict-${username}@wendigo.local"
    patch_user_email "$pk" "$local_email" "$username"
  done < <(echo "$CONFLICTS_JSON" | python3 -c "
import sys, json
users = json.load(sys.stdin).get('results') or []
others = [u for u in users if u.get('username') != 'akadmin']
if not others:
    sys.exit(0)
for u in others:
    print(u['pk'], u.get('username') or 'user', u.get('email') or '', sep='\t')
")
  if ! echo "$CONFLICTS_JSON" | python3 -c "
import sys, json
others = [u for u in json.load(sys.stdin).get('results') or [] if u.get('username') != 'akadmin']
sys.exit(0 if others else 1)
"; then
    echo "(aucun autre utilisateur)"
  fi
fi

echo "=== Vérification ==="
VERIFY="$(api "$URL/api/v3/core/users/" --data-urlencode "username=akadmin")"
echo "$VERIFY" | python3 -c "
import sys, json
u = json.load(sys.stdin)['results'][0]
print(f\"akadmin email={u.get('email')} is_superuser={u.get('is_superuser')}\")
"
echo "OK — réessayez la connexion Google."
