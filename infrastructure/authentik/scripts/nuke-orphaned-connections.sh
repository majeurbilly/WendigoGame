#!/usr/bin/env bash
# Purge les liaisons OAuth orphelines (UserSourceConnection) et affiche les échecs de policy.
set -euo pipefail

URL="${AUTHENTIK_URL:-http://localhost:9000}"
TOKEN="${AUTHENTIK_API_TOKEN:-}"
OAUTH_PATH="sources/user_connections/oauth/"
EVENTS_PATH="events/events/"

if [[ -z "$TOKEN" ]]; then
  echo "export AUTHENTIK_API_TOKEN='<clé API>'"
  exit 1
fi

export URL TOKEN OAUTH_PATH EVENTS_PATH

echo "=== GET /api/v3/${OAUTH_PATH} ==="
DELETED=0
FAILED=0

CONN_LINES="$(python3 <<'PY'
import json, os, sys, urllib.request

url = os.environ["URL"].rstrip("/")
token = os.environ["TOKEN"]
path = os.environ["OAUTH_PATH"]


def fetch(api_url: str) -> dict:
    req = urllib.request.Request(
        api_url,
        headers={"Authorization": f"Bearer {token}", "Accept": "application/json"},
    )
    with urllib.request.urlopen(req, timeout=120) as resp:
        return json.load(resp)


next_url = f"{url}/api/v3/{path}"
found: list[dict] = []
while next_url:
    data = fetch(next_url)
    found.extend(data.get("results") or [])
    next_url = data.get("next")

print(f"connections_found={len(found)}", file=sys.stderr, flush=True)
for c in found:
    user = c.get("user")
    user_pk = user if isinstance(user, int) else (user or {}).get("pk", "")
    source = c.get("source")
    source_slug = source if isinstance(source, str) else (source or {}).get("slug", "")
    print(f"{c['pk']}\t{user_pk}\t{source_slug}", flush=True)
PY
2>&1)"

echo "$CONN_LINES" | grep '^connections_found=' || true

while IFS=$'\t' read -r pk user_pk source; do
  [[ -z "$pk" ]] && continue
  http="$(curl -sS -o /tmp/ak-nuke-conn.json -w "%{http_code}" \
    -X DELETE -H "Authorization: Bearer $TOKEN" \
    "$URL/api/v3/${OAUTH_PATH}${pk}/")"
  if [[ "$http" == "204" || "$http" == "200" ]]; then
    echo "  SUPPRIMÉ connection pk=$pk user=$user_pk source=$source — HTTP $http"
    DELETED=$((DELETED + 1))
  else
    echo "  ÉCHEC connection pk=$pk — HTTP $http"
    cat /tmp/ak-nuke-conn.json
    FAILED=$((FAILED + 1))
  fi
done <<<"$(echo "$CONN_LINES" | grep -v '^connections_found=' || true)"

CONN_COUNT="$(python3 <<'PY'
import json, os, urllib.request
url = os.environ["URL"].rstrip("/")
token = os.environ["TOKEN"]
path = os.environ["OAUTH_PATH"]
req = urllib.request.Request(
    f"{url}/api/v3/{path}",
    headers={"Authorization": f"Bearer {token}", "Accept": "application/json"},
)
with urllib.request.urlopen(req, timeout=60) as resp:
    data = json.load(resp)
print(len(data.get("results") or []))
PY
)"

echo ""
echo "=== Résumé purge OAuth ==="
echo "  supprimées : $DELETED"
echo "  échecs     : $FAILED"
echo "  restantes  : $CONN_COUNT (doit être 0)"

if [[ "$FAILED" -gt 0 ]]; then
  exit 1
fi

echo ""
echo "=== Événements policy_execution_failed ==="
python3 <<'PY'
import json, os, urllib.parse, urllib.request
from datetime import datetime

url = os.environ["URL"].rstrip("/")
token = os.environ["TOKEN"]
events_path = os.environ["EVENTS_PATH"]
params = urllib.parse.urlencode({"action": "policy_execution_failed"})
api = f"{url}/api/v3/{events_path}?{params}"


def fetch(api_url: str) -> dict:
    req = urllib.request.Request(
        api_url,
        headers={"Authorization": f"Bearer {token}", "Accept": "application/json"},
    )
    with urllib.request.urlopen(req, timeout=120) as resp:
        return json.load(resp)


events: list[dict] = []
next_url = api
while next_url:
    data = fetch(next_url)
    events.extend(data.get("results") or [])
    next_url = data.get("next")

print(f"total_events={len(events)}")
if not events:
    print("(aucun événement policy_execution_failed récent)")
else:
    for ev in events[:25]:
        ts = ev.get("created") or ""
        ctx = ev.get("context") or {}
        msg = ctx.get("message") or ctx.get("result") or ""
        policy = ctx.get("policy") or ctx.get("binding") or ""
        print(f"  [{ts}] policy={policy!s} message={str(msg)[:200]}")
    if len(events) > 25:
        print(f"  … et {len(events) - 25} autre(s)")
PY

if [[ "$CONN_COUNT" == "0" ]]; then
  echo ""
  echo "OK — aucune liaison OAuth orpheline restante."
else
  echo ""
  echo "ATTENTION : des connexions OAuth subsistent encore."
  exit 1
fi
