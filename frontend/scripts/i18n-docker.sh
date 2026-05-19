#!/bin/sh
# Lingui via Node 22 in Docker (WSL/Windows node_modules are not Linux-compatible when bind-mounted).
set -e

CMD="${1:-extract}"
shift || true

docker run --rm \
  -v "${PWD}:/app" \
  -v wendigo_frontend_node_modules:/app/node_modules \
  -w /app \
  node:22-alpine \
  sh -lc "
    npm ci
    npx lingui ${CMD} $*
  "
