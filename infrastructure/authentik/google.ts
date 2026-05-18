import * as authentik from '@pulumi/authentik'
import { googleClientId, googleClientSecret } from './config'

const defaultSourceAuthentication = authentik.getFlowOutput({
  slug: 'default-source-authentication',
})

/** Mappe email, nom, username et picture Google vers l'utilisateur Authentik. */
const GOOGLE_PROFILE_MAPPING_EXPRESSION = `info = request.context.get("oauth_userinfo") or {}
email = info.get("email") or ""
username = email.split("@")[0] if "@" in email else (info.get("sub") or "")
picture = info.get("picture") or ""
return {
    "email": email,
    "username": username,
    "name": info.get("name") or info.get("given_name") or username or email,
    "attributes": {
        "picture": picture,
        "avatar": picture,
    },
}
`

/** Renforce les attributs avant l'écriture utilisateur (enrollment). */
const GOOGLE_ENROLLMENT_ATTRIBUTES_POLICY = `info = request.context.get("oauth_userinfo") or {}
prompt = request.context.setdefault("prompt_data", {})
attrs = prompt.setdefault("attributes", {})
picture = info.get("picture") or ""
if picture:
    attrs["picture"] = picture
    attrs["avatar"] = picture
if info.get("email"):
    prompt["email"] = info["email"]
if info.get("name"):
    prompt["name"] = info["name"]
return True
`

export const googleProfileMapping = createGoogleProfileMapping()

// --- Flux d'enrollment Google (création / mise à jour utilisateur) ---

export const googleEnrollmentFlow = new authentik.Flow('wendigo-google-enrollment', {
  name: 'Wendigo — Inscription Google',
  slug: 'wendigo-google-enrollment',
  title: 'Wendigo — Inscription Google',
  designation: 'enrollment',
  authentication: 'none',
})

const enrollmentSsoPolicy = new authentik.PolicyExpression('wendigo-google-enrollment-sso', {
  name: 'Wendigo Google — enrollment SSO uniquement',
  expression: 'return ak_is_sso_flow',
})

const enrollmentAttributesPolicy = new authentik.PolicyExpression(
  'wendigo-google-enrollment-attributes',
  {
    name: 'Wendigo Google — copie picture/email vers prompt_data',
    expression: GOOGLE_ENROLLMENT_ATTRIBUTES_POLICY,
  }
)

const googleEnrollmentUserWrite = new authentik.StageUserWrite('wendigo-google-enrollment-write', {
  name: 'Wendigo Google — création utilisateur',
  userCreationMode: 'always_create',
  userType: 'external',
})

const googleEnrollmentUserLogin = new authentik.StageUserLogin('wendigo-google-enrollment-login', {
  name: 'Wendigo Google — login post-inscription',
})

const googleEnrollmentWriteBinding = new authentik.FlowStageBinding(
  'wendigo-google-enrollment-write-binding',
  {
    target: googleEnrollmentFlow.uuid,
    stage: googleEnrollmentUserWrite.id,
    order: 0,
    reEvaluatePolicies: true,
  }
)

new authentik.FlowStageBinding('wendigo-google-enrollment-login-binding', {
  target: googleEnrollmentFlow.uuid,
  stage: googleEnrollmentUserLogin.id,
  order: 1,
})

new authentik.PolicyBinding('wendigo-google-enrollment-sso-binding', {
  target: googleEnrollmentFlow.uuid,
  policy: enrollmentSsoPolicy.id,
  order: 0,
  enabled: true,
})

new authentik.PolicyBinding('wendigo-google-enrollment-attributes-binding', {
  target: googleEnrollmentWriteBinding.flowStageBindingId,
  policy: enrollmentAttributesPolicy.id,
  order: 0,
  enabled: true,
})

// --- Source OAuth Google ---

export const googleSource = new authentik.SourceOauth('wendigo-google-source', {
  name: 'Google',
  slug: 'google',
  providerType: 'google',
  consumerKey: googleClientId,
  consumerSecret: googleClientSecret,
  enabled: true,
  promoted: true,
  userMatchingMode: 'email_link',
  authenticationFlow: defaultSourceAuthentication.id,
  enrollmentFlow: googleEnrollmentFlow.uuid,
  propertyMappings: [googleProfileMapping.id],
})

// --- Flux d'authentification Wendigo (Google uniquement, sans mot de passe) ---

export const wendigoIdentificationStage = new authentik.StageIdentification(
  'wendigo-google-identification',
  {
    name: 'Wendigo — Connexion Google',
    sources: [googleSource.uuid],
    userFields: [],
    showSourceLabels: false,
    enableRememberMe: false,
  },{
    provider: 
  }
)

const wendigoAuthUserLogin = new authentik.StageUserLogin('wendigo-google-auth-login', {
  name: 'Wendigo — session utilisateur',
})

export const wendigoAuthenticationFlow = new authentik.Flow('wendigo-authentication', {
  name: 'Wendigo — Authentification Google',
  slug: 'wendigo-authentication',
  title: 'Connexion au Conseil',
  designation: 'authentication',
  authentication: 'require_unauthenticated',
})

new authentik.FlowStageBinding('wendigo-auth-identification-binding', {
  target: wendigoAuthenticationFlow.uuid,
  stage: wendigoIdentificationStage.id,
  order: 10,
})

new authentik.FlowStageBinding('wendigo-auth-login-binding', {
  target: wendigoAuthenticationFlow.uuid,
  stage: wendigoAuthUserLogin.id,
  order: 100,
})

export const googleCallbackUri = googleSource.callbackUri
export const googleSourceId = googleSource.id

function createGoogleProfileMapping(provider: authentik.Provider) {
  return new authentik.PropertyMappingSourceOauth(
    'wendigo-google-profile-mapping',
    {
      name: 'Wendigo Google — profil (email, username, picture)',
      expression: GOOGLE_PROFILE_MAPPING_EXPRESSION,
    },
    {
      provider
    }
  )
}
