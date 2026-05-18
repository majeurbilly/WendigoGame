#!/usr/bin/env bash
# Libère billy.halle.bh@gmail.com et stringemptycompany@gmail.com pour l'inscription Google.
set -euo pipefail

URL="${AUTHENTIK_URL:-http://localhost:9000}"
TOKEN="${AUTHENTIK_API_TOKEN:-}"

GMAIL_1="billy.halle.bh@gmail.com"
GMAIL_2="stringemptycompany@gmail.com"

if [[ -z "$TOKEN" ]]; then
  echo "export AUTHENTIK_API_TOKEN='<clé API>'"
  exit 1
fi

export URL TOKEN GMAIL_1 GMAIL_2

patch_user_email() {
  local pk="$1" email="$2" label="$3"
  local http
  http="$(curl -sS -o /tmp/ak-free-gmail.json -w "%{http_code}" \
    -X PATCH -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
    -d "{\"email\": \"$email\"}" \
    "$URL/api/v3/core/users/${pk}/")"
  echo "  PATCH $label (pk=$pk) → $email — HTTP $http"
  if [[ "$http" != "200" ]]; then
    cat /tmp/ak-free-gmail.json
    return 1
  fi
}

echo "=== Liste des utilisateurs (pagination API) ==="
MATCHES="$(python3 <<'PY'
import json, os, urllib.request

url = os.environ["URL"].rstrip("/")
token = os.environ["TOKEN"]
targets = {
    os.environ["GMAIL_1"].strip().lower(),
    os.environ["GMAIL_2"].strip().lower(),
}


def fetch(api_url: str) -> dict:
    req = urllib.request.Request(
        api_url,
        headers={
            "Authorization": f"Bearer {token}",
            "Accept": "application/json",
        },
    )
    with urllib.request.urlopen(req, timeout=120) as resp:
        return json.load(resp)


def email_matches(u: dict) -> bool:
    email = (u.get("email") or "").strip().lower()
    if email in targets:
        return True
    blob = " ".join(
        str(u.get(k) or "")
        for k in ("email", "username", "name")
    ).lower()
    return any(t in blob for t in targets)


next_url = f"{url}/api/v3/core/users/"
found: list[dict] = []
page = 0
while next_url:
    page += 1
    data = fetch(next_url)
    for u in data.get("results") or []:
        if email_matches(u):
            found.append(u)
    next_url = data.get("next")

print(f"pages_scanned={page} users_matched={len(found)}", flush=True)
for u in found:
    print(
        f"{u['pk']}\t{u.get('username') or ''}\t{u.get('email') or ''}",
        flush=True,
    )
PY
)"

echo "$MATCHES" | head -1
ROWS="$(echo "$MATCHES" | tail -n +2)"
if [[ -z "${ROWS// }" ]]; then
  echo "(aucun utilisateur avec ces adresses Gmail)"
else
  echo "=== Archivage des emails conflictuels ==="
  while IFS=$'\t' read -r pk username old_email; do
    [[ -z "$pk" ]] && continue
    archive_email="test_archive_${pk}@wendigo.local"
    echo "  $username : $old_email → $archive_email"
    patch_user_email "$pk" "$archive_email" "$username"
  done <<<"$ROWS"
fi

echo "=== Liaisons OAuth orphelines (sources/user_connections/oauth/) ==="
python3 <<'PY'
import json, os, urllib.request

url = os.environ["URL"].rstrip("/")
token = os.environ["TOKEN"]
targets = {
    os.environ["GMAIL_1"].strip().lower(),
    os.environ["GMAIL_2"].strip().lower(),
}


def fetch(api_url: str) -> dict:
    req = urllib.request.Request(
        api_url,
        headers={"Authorization": f"Bearer {token}", "Accept": "application/json"},
    )
    with urllib.request.urlopen(req, timeout=120) as resp:
        return json.load(resp)


def delete_conn(pk: int) -> None:
    del_url = f"{url}/api/v3/sources/user_connections/oauth/{pk}/"
    req = urllib.request.Request(
        del_url,
        method="DELETE",
        headers={"Authorization": f"Bearer {token}"},
    )
    with urllib.request.urlopen(req, timeout=60) as resp:
        print(f"  DELETE oauth connection pk={pk} — HTTP {resp.status}")


next_url = f"{url}/api/v3/sources/user_connections/oauth/"
deleted = 0
while next_url:
    data = fetch(next_url)
    for conn in data.get("results") or []:
        blob = json.dumps(conn, default=str).lower()
        if any(t in blob for t in targets):
            delete_conn(conn["pk"])
            deleted += 1
    next_url = data.get("next")
if deleted == 0:
    print("  (aucune liaison OAuth à supprimer)")
PY

echo "=== Vérification (aucun compte ne doit garder ces Gmail) ==="
for gmail in "$GMAIL_1" "$GMAIL_2"; do
  COUNT="$(curl -sS -G -H "Authorization: Bearer $TOKEN" -H "Accept: application/json" \
    --data-urlencode "email=$gmail" \
    "$URL/api/v3/core/users/" | python3 -c "
import sys, json
print(len(json.load(sys.stdin).get('results') or []))
")"
  echo "  $gmail → $COUNT utilisateur(s)"
  if [[ "$COUNT" != "0" ]]; then
    echo "ERREUR : l'adresse $gmail est encore utilisée."
    exit 1
  fi
done

echo "OK — les deux adresses Gmail sont libres pour l'inscription Google."
