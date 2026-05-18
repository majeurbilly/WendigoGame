import * as pulumi from '@pulumi/pulumi'
import * as authentik from '@pulumi/authentik'
import { akOpts } from '../../pulumi/provider-opts'
import type { SystemReferences } from '../../system/references'

/**
 * Scope `profile` étendu : relaie `picture` depuis les attributs utilisateur
 * (fédération Google) ou depuis oauth_userinfo du contexte de connexion.
 */
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
`

export function createOidcScopeMappings(system: SystemReferences) {
  const profileScopeMapping = new authentik.PropertyMappingProviderScope(
    'wendigo-profile-scope',
    {
      name: 'Wendigo — OpenID profile (avec picture Google)',
      scopeName: 'profile',
      description:
        'Profil OIDC Wendigo : claims standard + picture (Google / attributs utilisateur)',
      expression: PROFILE_SCOPE_EXPRESSION,
    },
    akOpts()
  )

  const oidcPropertyMappingIds = pulumi
    .all([system.defaultOidcScopes.ids, profileScopeMapping.id])
    .apply(([managedIds, profileId]) => [...managedIds, profileId])

  return { profileScopeMapping, oidcPropertyMappingIds }
}

export type OidcScopeMappingsResult = ReturnType<typeof createOidcScopeMappings>
