import * as authentik from '@pulumi/authentik';
import * as pulumi from '@pulumi/pulumi';
import { akOpts } from '../../../utils';
import type { SystemReferences } from '../../system/references';

const PROFILE_SCOPE_EXPRESSION = `return {
    "name": request.user.name,
    "given_name": request.user.name,
    "preferred_username": request.user.username,
    "nickname": request.user.username,
    "groups": [group.name for group in request.user.ak_groups.all()],
    "picture": (
        (request.user.attributes or {}).get("picture")
        or (request.user.attributes or {}).get("avatar")
        or (request.user.attributes or {}).get("avatar_url")
        or (request.context.get("oauth_userinfo") or {}).get("picture")
        or ""
    ),
}
`;

export function createOidcScopeMappings(system: SystemReferences, provider: authentik.Provider) {
  const profileScopeMapping = new authentik.PropertyMappingProviderScope(
    'wendigo-profile-scope',
    {
      name: 'Wendigo: OpenID profile with Google picture',
      scopeName: 'profile',
      description: 'Wendigo OIDC profile: standard claims + picture from Google or user attributes',
      expression: PROFILE_SCOPE_EXPRESSION,
    },
    akOpts(provider),
  );

  // Deterministic: only attach Wendigo-managed scopes. Avoid lookups of Authentik-managed default scopes.
  const oidcPropertyMappingIds = pulumi
    .all([profileScopeMapping.id])
    .apply(([profileId]) => [profileId]);

  return { profileScopeMapping, oidcPropertyMappingIds };
}

export type OidcScopeMappingsResult = ReturnType<typeof createOidcScopeMappings>;
