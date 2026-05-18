#!/usr/bin/env bash
# Supprime tous les utilisateurs de test ; préserve akadmin et les comptes de service internes.
set -euo pipefail

URL="${AUTHENTIK_URL:-http://localhost:9000}"
TOKEN="${AUTHENTIK_API_TOKEN:-}"

if [[ -z "$TOKEN" ]]; then
  echo "export AUTHENTIK_API_TOKEN='<clé API>'"
  exit 1
fi

export URL TOKEN

echo "=== Inventaire (/api/v3/core/users/) ==="
export URL TOKEN
TO_DELETE="$(python3 <<'PY'
import json, os, urllib.request

url = os.environ["URL"].rstrip("/")
token = os.environ["TOKEN"]


def is_protected(u: dict) -> bool:
    username = (u.get("username") or "").strip()
    path = (u.get("path") or "").strip()
    user_type = (u.get("type") or "").strip().lower()
    if username == "akadmin":
        return True
    if path.startswith("goauthentik.io"):
        return True
    if "service_account" in user_type:
        return True
    if username.startswith("ak-outpost-"):
        return True
    return False


def fetch(api_url: str) -> dict:
    req = urllib.request.Request(
        api_url,
        headers={"Authorization": f"Bearer {token}", "Accept": "application/json"},
    )
    with urllib.request.urlopen(req, timeout=120) as resp:
        return json.load(resp)


next_url = f"{url}/api/v3/core/users/"
all_users: list[dict] = []
while next_url:
    data = fetch(next_url)
    all_users.extend(data.get("results") or [])
    next_url = data.get("next")

protected = [u for u in all_users if is_protected(u)]
targets = [u for u in all_users if not is_protected(u)]

print(f"total={len(all_users)} proteges={len(protected)} a_supprimer={len(targets)}", flush=True)
for u in protected:
    print(
        f"KEEP\t{u['pk']}\t{u.get('username') or ''}\t"
        f"{u.get('email') or ''}\ttype={u.get('type')}\tpath={u.get('path')}",
        flush=True,
    )
for u in targets:
    print(
        f"DELETE\t{u['pk']}\t{u.get('username') or ''}\t{u.get('email') or ''}",
        flush=True,
    )
PY
)"

echo "$TO_DELETE" | head -1
DELETE_ROWS="$(echo "$TO_DELETE" | grep '^DELETE' || true)"

if [[ -z "$DELETE_ROWS" ]]; then
  echo ""
  echo "Aucun utilisateur de test à supprimer."
  echo "=== Comptes préservés ==="
  echo "$TO_DELETE" | grep '^KEEP' || true
  exit 0
fi

echo ""
echo "=== Suppression ==="
DELETED=0
FAILED=0
while IFS=$'\t' read -r _action pk username email; do
  [[ -z "$pk" ]] && continue
  if [[ "$username" == "akadmin" ]]; then
    echo "  REFUSÉ akadmin (pk=$pk) — règle de sécurité"
    continue
  fi
  http="$(curl -sS -o /tmp/ak-nuke-user.json -w "%{http_code}" \
    -X DELETE -H "Authorization: Bearer $TOKEN" \
    "$URL/api/v3/core/users/${pk}/")"
  if [[ "$http" == "204" || "$http" == "200" ]]; then
    echo "  SUPPRIMÉ pk=$pk user=$username email=${email:-<vide>} — HTTP $http"
    DELETED=$((DELETED + 1))
  else
    echo "  ÉCHEC pk=$pk user=$username — HTTP $http"
    cat /tmp/ak-nuke-user.json
    FAILED=$((FAILED + 1))
  fi
done <<<"$DELETE_ROWS"

echo ""
echo "=== Résumé ==="
echo "  supprimés : $DELETED"
echo "  échecs    : $FAILED"
echo "=== Comptes préservés ==="
echo "$TO_DELETE" | grep '^KEEP' || true

if [[ "$FAILED" -gt 0 ]]; then
  exit 1
fi

echo "OK — table rase terminée."
