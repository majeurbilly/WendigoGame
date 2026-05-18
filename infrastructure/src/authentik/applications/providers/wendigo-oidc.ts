import type * as authentik from '@pulumi/authentik';
import type * as pulumi from '@pulumi/pulumi';
import {
  allowedRedirectUris,
  applicationName,
  authentikBaseUrl,
  authentikToken,
  oidcClientId,
  oidcIncludePropertyMappings,
} from '../../../config';
import type { OidcScopeMappingsResult } from '../../customization/property-mappings/oauth-scopes';
import type { WendigoAuthenticationFlowResult } from '../../flows-and-stages/flows/wendigo-authentication';
import { flowUuidFromLookup, type SystemReferences } from '../../system/references';
import { OidcProviderResource } from './oidc-provider-resource';

export function createWendigoOidcProvider(
  deps: {
    provider: authentik.Provider;
    system: SystemReferences;
    scopeMappings: OidcScopeMappingsResult;
    authentication: WendigoAuthenticationFlowResult;
  },
  opts?: pulumi.CustomResourceOptions,
) {
  const args: ConstructorParameters<typeof OidcProviderResource>[1] = {
    authentikUrl: authentikBaseUrl,
    authentikToken,
    name: applicationName,
    clientId: oidcClientId,
    clientType: 'public',
    authorizationFlow: flowUuidFromLookup(deps.system.flows.authorization),
    invalidationFlow: flowUuidFromLookup(deps.system.flows.invalidation),
    authenticationFlow: deps.authentication.flow.uuid,
    signingKey: deps.system.signingCertificate.id,
    redirectUris: allowedRedirectUris,
    issuerMode: 'per_provider',
    subMode: 'user_uuid',
    includeClaimsInIdToken: true,
    accessTokenValidity: 'minutes=15',
    refreshTokenValidity: 'days=30',
  };

  if (oidcIncludePropertyMappings) {
    args.propertyMappings = deps.scopeMappings.oidcPropertyMappingIds;
  }

  const oidcProvider = new OidcProviderResource('wendigo-oidc', args, {
    dependsOn: [deps.provider],
    ...opts,
  });

  return { provider: oidcProvider };
}

export type WendigoOidcProviderResult = ReturnType<typeof createWendigoOidcProvider>;
