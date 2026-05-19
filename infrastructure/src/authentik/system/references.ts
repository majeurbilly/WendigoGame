import * as authentik from '@pulumi/authentik';
import type * as pulumi from '@pulumi/pulumi';
import { akInvokeOpts } from '../../utils';

type FlowLookup = ReturnType<typeof authentik.getFlowOutput>;

export function flowUuidFromLookup(flow: FlowLookup): pulumi.Output<string> {
  return flow.id;
}

const MANAGED_SCOPE_OPENID = 'goauthentik.io/providers/oauth2/scope-openid';
const MANAGED_SCOPE_EMAIL = 'goauthentik.io/providers/oauth2/scope-email';
const MANAGED_SCOPE_OFFLINE = 'goauthentik.io/providers/oauth2/scope-offline_access';

export function loadSystemReferences(provider: authentik.Provider) {
  const invoke = akInvokeOpts(provider);

  const flows = {
    authorization: authentik.getFlowOutput(
      { slug: 'default-provider-authorization-implicit-consent' },
      invoke,
    ),
    invalidation: authentik.getFlowOutput({ slug: 'default-provider-invalidation-flow' }, invoke),
    authentication: authentik.getFlowOutput({ slug: 'default-authentication-flow' }, invoke),
    defaultSourceAuthentication: authentik.getFlowOutput(
      { slug: 'default-source-authentication' },
      invoke,
    ),
  };

  const signingCertificate = authentik.getCertificateKeyPairOutput(
    { name: 'authentik Self-signed Certificate' },
    invoke,
  );

  const defaultOidcScopes = authentik.getPropertyMappingProviderScopeOutput(
    {
      managedLists: [MANAGED_SCOPE_OPENID, MANAGED_SCOPE_EMAIL, MANAGED_SCOPE_OFFLINE],
    },
    invoke,
  );

  return { flows, signingCertificate, defaultOidcScopes };
}

export type SystemReferences = ReturnType<typeof loadSystemReferences>;
