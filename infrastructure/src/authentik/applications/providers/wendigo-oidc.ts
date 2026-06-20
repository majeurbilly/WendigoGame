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
import { lookupAuthentikSelfSignedCertificate } from '../../system/signing-certificate';
import type { SystemReferences } from '../../system/references';
import { OidcProviderResource } from './oidc-provider-resource';

export function createWendigoOidcProvider(
  deps: {
    provider: authentik.Provider;
    system: SystemReferences;
    scopeMappings?: OidcScopeMappingsResult;
    authentication: WendigoAuthenticationFlowResult;
  },
  opts?: pulumi.CustomResourceOptions,
) {
  const signingCertificate = lookupAuthentikSelfSignedCertificate(deps.provider);

  const args: ConstructorParameters<typeof OidcProviderResource>[1] = {
    authentikUrl: authentikBaseUrl,
    authentikToken,
    name: applicationName,
    clientId: oidcClientId,
    clientType: 'public',
    authorizationFlow: deps.system.flows.authorization.uuid,
    invalidationFlow: deps.system.flows.invalidation.uuid,
    authenticationFlow: deps.authentication.flow.uuid,
    signingKey: signingCertificate.id,
    redirectUris: allowedRedirectUris,
    issuerMode: 'per_provider',
    subMode: 'user_uuid',
    includeClaimsInIdToken: true,
    accessTokenValidity: 'minutes=15',
    refreshTokenValidity: 'days=30',
  };

  if (oidcIncludePropertyMappings && deps.scopeMappings) {
    args.propertyMappings = deps.scopeMappings.oidcPropertyMappingIds;
  }

  const oidcProvider = new OidcProviderResource('wendigo-oidc', args, {
    dependsOn: [deps.provider],
    ...opts,
  });

  return { provider: oidcProvider };
}

export type WendigoOidcProviderResult = ReturnType<typeof createWendigoOidcProvider>;
