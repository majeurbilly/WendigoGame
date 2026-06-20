import * as authentik from '@pulumi/authentik';
import * as pulumi from '@pulumi/pulumi';
import { akInvokeOpts, akOpts } from '../../../utils';
import type { SystemReferences } from '../../system/references';

const MANAGED_SCOPE_OPENID = 'goauthentik.io/providers/oauth2/scope-openid';
const MANAGED_SCOPE_EMAIL = 'goauthentik.io/providers/oauth2/scope-email';

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
  void system;

  const openidScope = authentik.getPropertyMappingProviderScopeOutput(
    { managed: MANAGED_SCOPE_OPENID },
    akInvokeOpts(provider),
  );
  const emailScope = authentik.getPropertyMappingProviderScopeOutput(
    { managed: MANAGED_SCOPE_EMAIL },
    akInvokeOpts(provider),
  );

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

  const oidcPropertyMappingIds = pulumi
    .all([openidScope.id, emailScope.id, profileScopeMapping.id])
    .apply(([openidId, emailId, profileId]) => [openidId, emailId, profileId]);

  return { openidScope, emailScope, profileScopeMapping, oidcPropertyMappingIds };
}

export type OidcScopeMappingsResult = ReturnType<typeof createOidcScopeMappings>;
