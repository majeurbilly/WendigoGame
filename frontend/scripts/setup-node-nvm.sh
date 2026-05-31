#!/usr/bin/env bash
set -euo pipefail
FRONTEND_DIR="$(cd "$(dirname "$0")/.." && pwd)"
export NVM_DIR="${NVM_DIR:-$HOME/.nvm}"

if [[ ! -s "$NVM_DIR/nvm.sh" ]]; then
  echo "=== Installation de nvm ==="
  curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
fi

# shellcheck source=/dev/null
. "$NVM_DIR/nvm.sh"

cd "$FRONTEND_DIR"
echo "=== Node depuis .nvmrc ($FRONTEND_DIR/.nvmrc) ==="
nvm install
nvm use
node -v
npm -v

echo ""
echo "=== Réinstallation des dépendances ==="
rm -rf node_modules
npm install

echo ""
echo "=== OK — lancez : npm run dev ==="
