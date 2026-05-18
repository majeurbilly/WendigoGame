import * as pulumi from '@pulumi/pulumi'

const wendigoConfig = new pulumi.Config('wendigo')
const authentikConfig = new pulumi.Config('authentik')

/** Base URL Authentik sans slash final (config > AUTHENTIK_URL > défaut dev) */
export const authentikBaseUrl = (
  authentikConfig.get('url') ??
  process.env.AUTHENTIK_URL ??
  'http://localhost:9000'
).replace(/\/+$/, '')

function envOrConfig(envKey: string, configKey: string, fallback?: string): string {
  const fromEnv = process.env[envKey]?.trim()
  if (fromEnv) {
    return fromEnv
  }
  const fromConfig = wendigoConfig.get(configKey)?.trim()
  if (fromConfig) {
    return fromConfig
  }
  if (fallback !== undefined) {
    return fallback
  }
  throw new Error(`Valeur requise : variable ${envKey} ou config Pulumi wendigo:${configKey}`)
}

/** Client ID OIDC — WENDIGO_OIDC_CLIENT_ID > pulumi config wendigo:clientId */
export const oidcClientId = envOrConfig('WENDIGO_OIDC_CLIENT_ID', 'clientId', 'wendigo-dev')

/** Secret optionnel (client confidential) — vide pour SPA public + PKCE */
export const oidcClientSecret = process.env.WENDIGO_OIDC_CLIENT_SECRET?.trim() ?? ''

/** Google OAuth — GOOGLE_CLIENT_ID > pulumi config wendigo:googleClientId */
export const googleClientId = envOrConfig('GOOGLE_CLIENT_ID', 'googleClientId')

/** Google OAuth — GOOGLE_CLIENT_SECRET > pulumi config wendigo:googleClientSecret */
export const googleClientSecret = envOrConfig('GOOGLE_CLIENT_SECRET', 'googleClientSecret')

export const applicationName = 'Wendigo'
export const applicationSlug = 'wendigo'

/** URIs de redirection (dev + Docker frontend sur :5173) */
export function parseRedirectUris(raw: string): { matchingMode: string; url: string }[] {
  return raw
    .split(',')
    .map((u) => u.trim())
    .filter(Boolean)
    .map((url) => ({
      matchingMode: 'strict',
      url,
    }))
}

export const allowedRedirectUris = parseRedirectUris(
  wendigoConfig.get('redirectUris') ??
    'http://localhost:5173/,http://localhost:5173/login'
)

/**
 * Création OIDC en 2 temps si ProviderOauth2 provoque EOF (~36s timeout API) :
 *   1) pulumi up  (oidcIncludePropertyMappings=false par défaut)
 *   2) pulumi config set wendigo:oidcIncludePropertyMappings true && pulumi up
 */
export const oidcIncludePropertyMappings =
  wendigoConfig.getBoolean('oidcIncludePropertyMappings') ?? false
