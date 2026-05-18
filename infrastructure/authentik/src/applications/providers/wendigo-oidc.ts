import * as pulumi from '@pulumi/pulumi'
import * as authentik from '@pulumi/authentik'
import {
  allowedRedirectUris,
  applicationName,
  oidcClientId,
  oidcClientSecret,
  oidcIncludePropertyMappings,
} from '../../config'
import type { OidcScopeMappingsResult } from '../../customization/property-mappings/oauth-scopes'
import type { WendigoAuthenticationFlowResult } from '../../flows-and-stages/flows/wendigo-authentication'
import { flowUuidFromLookup, type SystemReferences } from '../../system/references'
import { akOpts } from '../../pulumi/provider-opts'

/**
 * Le plugin Terraform Authentik provoque EOF (~36s) sur create/update ProviderOauth2.
 * Ressource importée via API : Pulumi ne doit pas PATCHer Authentik (ignoreChanges).
 * Property mappings : scripts/patch-oidc-property-mappings.sh
 */
const OIDC_PULUMI_IGNORE_CHANGES = [
  'accessCodeValidity',
  'accessTokenValidity',
  'allowedRedirectUris',
  'authenticationFlow',
  'authorizationFlow',
  'clientId',
  'clientSecret',
  'clientType',
  'encryptionKey',
  'includeClaimsInIdToken',
  'invalidationFlow',
  'issuerMode',
  'logoutMethod',
  'logoutUri',
  'name',
  'propertyMappings',
  'refreshTokenThreshold',
  'refreshTokenValidity',
  'signingKey',
  'subMode',
  'jwksSources',
  'jwtFederationProviders',
  'jwtFederationSources',
]

export function createWendigoOidcProvider(
  deps: {
    system: SystemReferences
    scopeMappings: OidcScopeMappingsResult
    authentication: WendigoAuthenticationFlowResult
  },
  opts?: pulumi.CustomResourceOptions
) {
  const providerArgs: authentik.ProviderOauth2Args = {
    name: applicationName,
    clientId: oidcClientId,
    clientType: 'public',
    authorizationFlow: flowUuidFromLookup(deps.system.flows.authorization),
    invalidationFlow: flowUuidFromLookup(deps.system.flows.invalidation),
    authenticationFlow: deps.authentication.flow.uuid,
    signingKey: deps.system.signingCertificate.id,
    allowedRedirectUris,
    issuerMode: 'per_provider',
    subMode: 'user_uuid',
  }

  if (oidcIncludePropertyMappings) {
    providerArgs.propertyMappings = deps.scopeMappings.oidcPropertyMappingIds
    providerArgs.includeClaimsInIdToken = true
    providerArgs.accessTokenValidity = 'minutes=15'
    providerArgs.refreshTokenValidity = 'days=30'
  }

  if (oidcClientSecret) {
    providerArgs.clientSecret = oidcClientSecret
  }

  const provider = new authentik.ProviderOauth2(
    'wendigo-oidc',
    providerArgs,
    akOpts({
      ...opts,
      protect: false,
      ignoreChanges: [...OIDC_PULUMI_IGNORE_CHANGES, ...(opts?.ignoreChanges ?? [])],
    })
  )

  return { provider }
}

export type WendigoOidcProviderResult = ReturnType<typeof createWendigoOidcProvider>
