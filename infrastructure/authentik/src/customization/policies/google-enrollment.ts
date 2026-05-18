import * as authentik from '@pulumi/authentik'
import { akOpts } from '../../pulumi/provider-opts'

/** Renforce les attributs avant l'écriture utilisateur (enrollment). */
const GOOGLE_ENROLLMENT_ATTRIBUTES_POLICY = `info = request.context.get("oauth_userinfo") or {}
prompt = request.context.setdefault("prompt_data", {})
attrs = prompt.setdefault("attributes", {})
picture = info.get("picture") or ""
if picture:
    attrs["picture"] = picture
    attrs["avatar"] = picture
email = info.get("email") or ""
if email:
    prompt["email"] = email
if email and "@" in email:
    prompt["username"] = email.split("@")[0]
if info.get("name"):
    prompt["name"] = info["name"]
if info.get("sub") and not prompt.get("username"):
    prompt["username"] = info["sub"]
return True
`

/** Affiche le prompt username si absent ou vide dans prompt_data. */
const GOOGLE_ENROLLMENT_USERNAME_PROMPT_POLICY = `prompt = request.context.get('prompt_data') or {}
return not prompt.get('username')
`

export function createGoogleEnrollmentPolicies() {
  const ssoPolicy = new authentik.PolicyExpression(
    'wendigo-google-enrollment-sso',
    {
    name: 'Wendigo Google — enrollment SSO uniquement',
    expression: 'return ak_is_sso_flow',
    },
    akOpts()
  )

  const attributesPolicy = new authentik.PolicyExpression(
    'wendigo-google-enrollment-attributes',
    {
      name: 'Wendigo Google — copie picture/email/username vers prompt_data',
      expression: GOOGLE_ENROLLMENT_ATTRIBUTES_POLICY,
    },
    akOpts()
  )

  const usernamePromptPolicy = new authentik.PolicyExpression(
    'wendigo-google-enrollment-if-username',
    {
      name: 'Wendigo Google — prompt username si absent ou vide',
      expression: GOOGLE_ENROLLMENT_USERNAME_PROMPT_POLICY,
    },
    akOpts()
  )

  return { ssoPolicy, attributesPolicy, usernamePromptPolicy }
}

export type GoogleEnrollmentPoliciesResult = ReturnType<typeof createGoogleEnrollmentPolicies>
