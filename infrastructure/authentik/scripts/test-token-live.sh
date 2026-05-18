#!/usr/bin/env bash
set -euo pipefail
URL="${AUTHENTIK_URL:-http://localhost:9000}"
TOKEN="${AUTHENTIK_API_TOKEN:-}"

if [[ -z "$TOKEN" ]]; then
  echo "export AUTHENTIK_API_TOKEN='ak-...'"
  exit 1
fi

echo "URL=$URL"
echo "Token prefix: ${TOKEN:0:10}... (len=${#TOKEN})"

echo -n "health: "
curl -s -o /dev/null -w "%{http_code}\n" "$URL/-/health/live/"

test_ep() {
  local name="$1"
  local path="$2"
  local code
  code=$(curl -s -o /tmp/ak-ep.json -w "%{http_code}" \
    -H "Authorization: Bearer $TOKEN" \
    "$URL$path")
  echo "[$code] $name"
  if [[ "$code" != "200" && "$code" != "201" ]]; then
    head -c 300 /tmp/ak-ep.json
    echo
  fi
}

test_ep "core/root" "/api/v3/"
test_ep "me" "/api/v3/core/users/me/"
test_ep "flows" "/api/v3/flows/instances/?slug=default-authentication-flow"
test_ep "tokens list" "/api/v3/core/tokens/"
