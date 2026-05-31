import * as authentik from '@pulumi/authentik';
import { akOpts } from '../../../utils';

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
`;

const GOOGLE_ENROLLMENT_USERNAME_PROMPT_POLICY = `prompt = request.context.get('prompt_data') or {}
return not prompt.get('username')
`;

export function createGoogleEnrollmentPolicies(provider: authentik.Provider) {
  const ssoPolicy = new authentik.PolicyExpression(
    'wendigo-google-enrollment-sso',
    {
      name: 'Wendigo Google: SSO enrollment only',
      expression: 'return ak_is_sso_flow',
    },
    akOpts(provider),
  );

  const attributesPolicy = new authentik.PolicyExpression(
    'wendigo-google-enrollment-attributes',
    {
      name: 'Wendigo Google: copy picture/email/username to prompt_data',
      expression: GOOGLE_ENROLLMENT_ATTRIBUTES_POLICY,
    },
    akOpts(provider),
  );

  const usernamePromptPolicy = new authentik.PolicyExpression(
    'wendigo-google-enrollment-if-username',
    {
      name: 'Wendigo Google: prompt username if missing or empty',
      expression: GOOGLE_ENROLLMENT_USERNAME_PROMPT_POLICY,
    },
    akOpts(provider),
  );

  return { ssoPolicy, attributesPolicy, usernamePromptPolicy };
}

export type GoogleEnrollmentPoliciesResult = ReturnType<typeof createGoogleEnrollmentPolicies>;
