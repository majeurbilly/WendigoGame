import type * as pulumi from '@pulumi/pulumi'
import { withAuthentikTimeouts } from './resource-options'

/**
 * Provider Authentik implicite via AUTHENTIK_TOKEN (sync depuis AUTHENTIK_API_TOKEN).
 * Pas de Provider explicite en état — évite token 1.1.0 figé et 403 à l'import.
 */
export function akOpts(opts?: pulumi.CustomResourceOptions): pulumi.CustomResourceOptions {
  return withAuthentikTimeouts(opts)
}

export function akInvokeOpts(): pulumi.InvokeOptions {
  return {}
}
