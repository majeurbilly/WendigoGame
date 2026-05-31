#!/usr/bin/env bash
# Lance Vite avec Node 22 depuis .nvmrc (évite globSync / Lingui 6 sous Node 20).
set -euo pipefail
FRONTEND_DIR="$(cd "$(dirname "$0")/.." && pwd)"
export NVM_DIR="${NVM_DIR:-$HOME/.nvm}"

if [[ ! -s "$NVM_DIR/nvm.sh" ]]; then
  echo "nvm introuvable. Lancez : bash scripts/setup-node-nvm.sh"
  exit 1
fi

# shellcheck source=/dev/null
. "$NVM_DIR/nvm.sh"
cd "$FRONTEND_DIR"
nvm use
exec npm run dev
