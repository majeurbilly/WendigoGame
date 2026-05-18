import * as pulumi from '@pulumi/pulumi'
import { loadDotEnv } from './src/config/env-load'
import { syncAuthentikProviderEnv } from './src/config/provider-env'
import { applicationSlug, authentikBaseUrl } from './src/config'

loadDotEnv()
syncAuthentikProviderEnv()

/**
 * Stack Pulumi — configuration Authentik pour Wendigo.
 *
 * Provider OIDC + application Wendigo : créés via API (scripts/bootstrap-oidc-via-api-and-import.sh)
 * car le plugin Terraform provoque EOF sur create/update ProviderOauth2.
 */
import { deploy } from './src/deploy'

const stack = deploy()

export const oidcProvider = stack.oidc.provider
export const oidcIssuerUrl = pulumi.interpolate`${authentikBaseUrl}/application/o/${applicationSlug}/`
export const oidcClientIdOut = stack.oidc.provider.clientId
export const oidcProviderId = stack.oidc.provider.id
export const applicationSlugOut = applicationSlug

// Customization — property mappings
export const profileScopeMapping = stack.scopeMappings.profileScopeMapping
export const oidcPropertyMappingIds = stack.scopeMappings.oidcPropertyMappingIds
export const googleProfileMapping = stack.googleProfileMapping.mapping

// Federation
export const googleSource = stack.google.source
export const googleCallbackUri = stack.googleCallbackUri
export const googleSourceId = stack.googleSourceId

// Flows & stages
export const googleEnrollmentFlow = stack.googleEnrollment.flow
export const wendigoAuthenticationFlow = stack.wendigoAuthentication.flow
export const wendigoIdentificationStage = stack.wendigoIdentification.stage
