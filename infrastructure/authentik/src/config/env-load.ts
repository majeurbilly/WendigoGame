import { existsSync, readFileSync } from 'fs'
import { resolve } from 'path'

/** Variables gérées par Pulumi (`authentik:token`, `authentik:url`) — ne pas les charger depuis .env. */
const PULUMI_MANAGED_KEYS = new Set(['AUTHENTIK_TOKEN', 'AUTHENTIK_URL'])

/**
 * Charge infrastructure/authentik/.env dans process.env (sans écraser les variables déjà définies).
 *
 * AUTHENTIK_TOKEN / AUTHENTIK_URL sont exclus : un token expiré dans .env écrasait
 * `pulumi config set --secret authentik:token` et provoquait les 6 erreurs invoke (403).
 */
export function loadDotEnv(): void {
  const envPath = resolve(process.cwd(), '.env')
  if (!existsSync(envPath)) {
    return
  }
  for (const line of readFileSync(envPath, 'utf8').split(/\r?\n/)) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) {
      continue
    }
    const eq = trimmed.indexOf('=')
    if (eq <= 0) {
      continue
    }
    const key = trimmed.slice(0, eq).trim()
    if (PULUMI_MANAGED_KEYS.has(key)) {
      continue
    }
    let value = trimmed.slice(eq + 1).trim()
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1)
    }
    if (process.env[key] === undefined) {
      process.env[key] = value
    }
  }
}
