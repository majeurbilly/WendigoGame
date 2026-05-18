import * as pulumi from '@pulumi/pulumi'

/**
 * Aligne AUTHENTIK_URL / AUTHENTIK_TOKEN pour le provider Terraform Authentik.
 * Priorité : AUTHENTIK_API_TOKEN (scripts) > pulumi config authentik:token
 */
export function syncAuthentikProviderEnv(): void {
  const cfg = new pulumi.Config('authentik')
  const url = cfg.get('url')
  if (url) {
    process.env.AUTHENTIK_URL = url.replace(/\/+$/, '')
  }

  const apiToken = process.env.AUTHENTIK_API_TOKEN?.trim()
  if (apiToken) {
    process.env.AUTHENTIK_TOKEN = apiToken
    return
  }

  delete process.env.AUTHENTIK_TOKEN
}
