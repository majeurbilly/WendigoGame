const [major, minor, patch] = process.versions.node.split('.').map(Number)
const ok = major > 22 || (major === 22 && minor >= 19)

if (!ok) {
  console.error(
    `\nLingui 6 requires Node.js >= 22.19 (current: ${process.versions.node}).\n` +
      '  nvm install 22 && nvm use 22\n' +
      '  # or: pnpm run i18n:extract:docker -- --clean\n',
  )
  process.exit(1)
}
