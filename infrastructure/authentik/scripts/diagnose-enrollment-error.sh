#!/usr/bin/env bash
# Diagnostique "Unknown error" sur wendigo-google-enrollment via les events API.
set -euo pipefail

URL="${AUTHENTIK_URL:-http://localhost:9000}"
TOKEN="${AUTHENTIK_API_TOKEN:-}"

if [[ -z "$TOKEN" ]]; then
  set -a
  # shellcheck source=/dev/null
  [[ -f "$(dirname "$0")/../.env" ]] && source "$(dirname "$0")/../.env"
  set +a
  TOKEN="${AUTHENTIK_API_TOKEN:-${AUTHENTIK_TOKEN:-}}"
fi

if [[ -z "$TOKEN" ]]; then
  echo "export AUTHENTIK_API_TOKEN='...'"
  exit 1
fi

export URL TOKEN

python3 <<'PY'
import json
import os
import urllib.parse
import urllib.request

url = os.environ["URL"].rstrip("/")
token = os.environ["TOKEN"]


def fetch_events(**params) -> list[dict]:
    q = urllib.parse.urlencode({**params, "page_size": params.get("page_size", 20)})
    api = f"{url}/api/v3/events/events/?{q}"
    items: list[dict] = []
    while api:
        req = urllib.request.Request(
            api,
            headers={"Authorization": f"Bearer {token}", "Accept": "application/json"},
        )
        with urllib.request.urlopen(req, timeout=120) as resp:
            data = json.load(resp)
        items.extend(data.get("results") or [])
        api = data.get("next")
        if len(items) >= int(params.get("limit", 20)):
            break
    return items[: int(params.get("limit", 20))]


def dump_event(ev: dict, idx: int) -> None:
    ctx = ev.get("context") or {}
    print(f"\n--- [{idx}] {ev.get('action')} @ {ev.get('created')} ---")
    print(f"user: {ev.get('user')}")
    for key in ("message", "exception", "error", "result", "binding"):
        if key in ctx and ctx[key]:
            print(f"context.{key}: {ctx[key]}")
    if ctx.get("http_request"):
        hr = ctx["http_request"]
        print(f"path: {hr.get('path')} method: {hr.get('method')}")
    if ctx.get("policy_uuid") or ctx.get("policy"):
        print(f"policy: {ctx.get('policy') or ctx.get('policy_uuid')}")
    if ctx.get("flow"):
        print(f"flow: {ctx.get('flow')}")
    if ctx.get("stage"):
        print(f"stage: {ctx.get('stage')}")
    # Dump full context if compact enough
    compact = json.dumps(ctx, indent=2, default=str)
    if len(compact) < 4000:
        print("full context:")
        print(compact)
    else:
        print("full context (truncated):")
        print(compact[:4000] + "\n…")


print("=== system_exception (5 derniers) ===")
sys_exc = fetch_events(action="system_exception", limit=5)
if not sys_exc:
    print("(aucun)")
else:
    for i, ev in enumerate(sys_exc, 1):
        dump_event(ev, i)

print("\n=== policy_execution_failed (5 derniers) ===")
pol_fail = fetch_events(action="policy_execution_failed", limit=5)
if not pol_fail:
    print("(aucun)")
else:
    for i, ev in enumerate(pol_fail, 1):
        dump_event(ev, i)

print("\n=== policy_exception (5 derniers) ===")
pol_exc = fetch_events(action="policy_exception", limit=5)
if not pol_exc:
    print("(aucun)")
else:
    for i, ev in enumerate(pol_exc, 1):
        dump_event(ev, i)

print("\n=== login_failed (5 derniers) ===")
login_fail = fetch_events(action="login_failed", limit=5)
if not login_fail:
    print("(aucun)")
else:
    for i, ev in enumerate(login_fail, 1):
        dump_event(ev, i)

# Recherche large : tout event récent contenant enrollment / unknown / username
print("\n=== Scan 50 events récents (mots-clés enrollment/username/unknown) ===")
req = urllib.request.Request(
    f"{url}/api/v3/events/events/?page_size=50",
    headers={"Authorization": f"Bearer {token}", "Accept": "application/json"},
)
with urllib.request.urlopen(req, timeout=120) as resp:
    recent = json.load(resp).get("results") or []

keywords = (
    "enrollment",
    "wendigo-google",
    "unknown",
    "username",
    "denied",
    "exception",
    "user_write",
    "prompt",
    "sso",
)
hits = []
for ev in recent:
    blob = json.dumps(ev, default=str).lower()
    if any(k in blob for k in keywords):
        hits.append(ev)

if not hits:
    print("(aucun hit — affichage des 10 plus récents)")
    hits = recent[:10]

for i, ev in enumerate(hits[:15], 1):
    dump_event(ev, i)
PY
