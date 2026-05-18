import * as pulumi from '@pulumi/pulumi'
import * as authentik from '@pulumi/authentik'

/** Token : AUTHENTIK_API_TOKEN (scripts) > authentik:token (Pulumi config) */
function resolveAuthentikToken(cfg: pulumi.Config): pulumi.Output<string> {
  const fromEnv = process.env.AUTHENTIK_API_TOKEN?.trim()
  if (fromEnv) {
    return pulumi.secret(fromEnv)
  }
  return cfg.requireSecret('token')
}

/**
 * Provider Authentik explicite — lit le token à jour depuis AUTHENTIK_API_TOKEN si défini.
 */
export function createAuthentikProvider(): authentik.Provider {
  const cfg = new pulumi.Config('authentik')
  const url = (cfg.get('url') ?? process.env.AUTHENTIK_URL ?? 'http://localhost:9000').replace(
    /\/+$/,
    ''
  )

  return new authentik.Provider('wendigo-authentik', {
    url,
    token: resolveAuthentikToken(cfg),
    insecure: cfg.getBoolean('insecure') ?? process.env.AUTHENTIK_INSECURE === 'true',
  })
}
