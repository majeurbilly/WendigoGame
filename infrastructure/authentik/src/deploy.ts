import { flowUuidFromLookup, loadSystemReferences } from './system/references'
import { createGoogleProfileMapping } from './customization/property-mappings/google-profile'
import { createOidcScopeMappings } from './customization/property-mappings/oauth-scopes'
import { createGoogleEnrollmentPolicies } from './customization/policies/google-enrollment'
import { createGoogleEnrollmentFlow } from './flows-and-stages/flows/google-enrollment'
import { createWendigoAuthenticationFlow } from './flows-and-stages/flows/wendigo-authentication'
import { createGoogleEnrollmentPromptStage } from './flows-and-stages/stages/enrollment-prompt'
import { createGoogleEnrollmentUserWriteStage } from './flows-and-stages/stages/user-write'
import {
  createGoogleEnrollmentUserLoginStage,
  createWendigoAuthUserLoginStage,
} from './flows-and-stages/stages/user-login'
import { createWendigoIdentificationStage } from './flows-and-stages/stages/google-identification'
import { bindGoogleEnrollmentFlow } from './flows-and-stages/bindings/google-enrollment-bindings'
import { bindWendigoAuthenticationFlow } from './flows-and-stages/bindings/wendigo-authentication-bindings'
import { createGoogleSource } from './federation/sources/google-oauth'
import { oidcIncludePropertyMappings } from './config'
import { createWendigoOidcProvider } from './applications/providers/wendigo-oidc'
import type * as pulumi from '@pulumi/pulumi'

/**
 * Orchestration linéaire Wendigo × Authentik.
 * Auth API : AUTHENTIK_TOKEN (exporté depuis AUTHENTIK_API_TOKEN par les scripts).
 */
export function deploy() {
  const system = loadSystemReferences()

  const scopeMappings = createOidcScopeMappings(system)
  const googleProfileMapping = createGoogleProfileMapping()
  const enrollmentPolicies = createGoogleEnrollmentPolicies()

  const googleEnrollment = createGoogleEnrollmentFlow()
  const enrollmentPrompt = createGoogleEnrollmentPromptStage()
  const enrollmentUserWrite = createGoogleEnrollmentUserWriteStage()
  const enrollmentUserLogin = createGoogleEnrollmentUserLoginStage()

  const enrollmentBindings = bindGoogleEnrollmentFlow({
    enrollment: googleEnrollment,
    prompt: enrollmentPrompt,
    userWrite: enrollmentUserWrite,
    userLogin: enrollmentUserLogin,
    policies: enrollmentPolicies,
  })

  const google = createGoogleSource(
    {
      defaultSourceAuthenticationFlowUuid: flowUuidFromLookup(
        system.flows.defaultSourceAuthentication
      ),
      enrollment: googleEnrollment,
      profileMapping: googleProfileMapping,
    },
    {
      dependsOn: [
        googleEnrollment.flow,
        enrollmentPrompt.stage,
        enrollmentUserWrite.stage,
        enrollmentUserLogin.stage,
        enrollmentBindings.promptBinding,
        enrollmentBindings.writeBinding,
      ],
    }
  )

  const wendigoAuthentication = createWendigoAuthenticationFlow()
  const wendigoIdentification = createWendigoIdentificationStage(
    { googleSourceUuid: google.source.uuid },
    { dependsOn: [google.source] }
  )
  const wendigoAuthUserLogin = createWendigoAuthUserLoginStage()

  const authBindings = bindWendigoAuthenticationFlow({
    authentication: wendigoAuthentication,
    identification: wendigoIdentification,
    userLogin: wendigoAuthUserLogin,
  })

  const oidcDependsOn: pulumi.Resource[] = [
    google.source,
    wendigoAuthentication.flow,
    wendigoIdentification.stage,
    wendigoAuthUserLogin.stage,
    authBindings.identificationBinding,
    authBindings.loginBinding,
  ]
  if (oidcIncludePropertyMappings) {
    oidcDependsOn.push(scopeMappings.profileScopeMapping)
  }

  const oidc = createWendigoOidcProvider(
    {
      system,
      scopeMappings,
      authentication: wendigoAuthentication,
    },
    { dependsOn: oidcDependsOn }
  )

  return {
    system,
    scopeMappings,
    googleProfileMapping,
    googleEnrollment,
    enrollmentPolicies,
    enrollmentBindings,
    google,
    wendigoAuthentication,
    wendigoIdentification,
    authBindings,
    oidc,
    googleCallbackUri: google.source.callbackUri,
    googleSourceId: google.source.id,
  }
}

export type DeployResult = ReturnType<typeof deploy>
