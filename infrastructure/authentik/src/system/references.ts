import * as pulumi from '@pulumi/pulumi'
import * as authentik from '@pulumi/authentik'
import { akInvokeOpts } from '../pulumi/provider-opts'

type FlowLookup = ReturnType<typeof authentik.getFlowOutput>

/**
 * UUID d'un flux Authentik issu d'un data source (getFlowOutput).
 * Le SDK expose `id` ; c'est bien l'UUID attendu par l'API pour les liaisons.
 */
export function flowUuidFromLookup(flow: FlowLookup): pulumi.Output<string> {
  return flow.id
}

/** Scopes OIDC gérés par Authentik (blueprint system/providers-oauth2.yaml) */
const MANAGED_SCOPE_OPENID = 'goauthentik.io/providers/oauth2/scope-openid'
const MANAGED_SCOPE_EMAIL = 'goauthentik.io/providers/oauth2/scope-email'
const MANAGED_SCOPE_OFFLINE = 'goauthentik.io/providers/oauth2/scope-offline_access'

/**
 * Lectures API Authentik (data sources) — appelées une seule fois depuis deploy.ts.
 */
export function loadSystemReferences() {
  const invoke = akInvokeOpts()

  const flows = {
    authorization: authentik.getFlowOutput(
      { slug: 'default-provider-authorization-implicit-consent' },
      invoke
    ),
    invalidation: authentik.getFlowOutput(
      { slug: 'default-provider-invalidation-flow' },
      invoke
    ),
    authentication: authentik.getFlowOutput(
      { slug: 'default-authentication-flow' },
      invoke
    ),
    defaultSourceAuthentication: authentik.getFlowOutput(
      { slug: 'default-source-authentication' },
      invoke
    ),
  }

  const signingCertificate = authentik.getCertificateKeyPairOutput(
    { name: 'authentik Self-signed Certificate' },
    invoke
  )

  const defaultOidcScopes = authentik.getPropertyMappingProviderScopeOutput(
    {
      managedLists: [MANAGED_SCOPE_OPENID, MANAGED_SCOPE_EMAIL, MANAGED_SCOPE_OFFLINE],
    },
    invoke
  )

  return { flows, signingCertificate, defaultOidcScopes }
}

export type SystemReferences = ReturnType<typeof loadSystemReferences>
