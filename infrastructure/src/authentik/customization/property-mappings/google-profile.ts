import * as authentik from '@pulumi/authentik';
import { akOpts } from '../../../utils';

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
`;

export function createGoogleProfileMapping(provider: authentik.Provider) {
  const mapping = new authentik.PropertyMappingSourceOauth(
    'wendigo-google-profile-mapping',
    {
      name: 'Wendigo Google: profile (email, username, picture)',
      expression: GOOGLE_PROFILE_MAPPING_EXPRESSION,
    },
    akOpts(provider),
  );

  return { mapping };
}

export type GoogleProfileMappingResult = ReturnType<typeof createGoogleProfileMapping>;
