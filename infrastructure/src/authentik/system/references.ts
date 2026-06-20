import * as authentik from '@pulumi/authentik';
import type * as pulumi from '@pulumi/pulumi';
import { akOpts } from '../../utils';

type FlowLookup = ReturnType<typeof authentik.getFlowOutput>;

export function flowUuidFromLookup(flow: FlowLookup): pulumi.Output<string> {
  return flow.id;
}

export function createSystemReferences(provider: authentik.Provider) {
  // Avoid invoking (looking up) Authentik "default-*" flows by slug, which can vary by Authentik version.
  // Instead, manage our own provider flows deterministically.
  const flows = {
    // Implicit consent: no stages (same as Authentik default-provider-authorization-implicit-consent).
    authorization: new authentik.Flow(
      'wendigo-provider-authorization-flow',
      {
        name: 'Wendigo: Provider Authorization',
        slug: 'wendigo-provider-authorization',
        title: 'Wendigo: Consent',
        designation: 'authorization',
        authentication: 'require_authenticated',
      },
      akOpts(provider),
    ),
    invalidation: new authentik.Flow(
      'wendigo-provider-invalidation-flow',
      {
        name: 'Wendigo: Provider Invalidation',
        slug: 'wendigo-provider-invalidation',
        title: 'Wendigo: Logout',
        designation: 'invalidation',
        authentication: 'none',
      },
      akOpts(provider),
    ),
    // Deterministic "source authentication" flow for OAuth sources (Google).
    sourceAuthentication: new authentik.Flow(
      'wendigo-source-authentication-flow',
      {
        name: 'Wendigo: Source Authentication',
        slug: 'wendigo-source-authentication',
        title: 'Wendigo: Continue',
        designation: 'authentication',
        authentication: 'require_unauthenticated',
      },
      akOpts(provider),
    ),
  };

  // Intentionally no Authentik lookups/invokes here: keep the deploy deterministic on a fresh instance.
  // Managed OIDC scopes are optional; when enabled, we only attach Wendigo-owned scopes.
  return { flows };
}

export type SystemReferences = ReturnType<typeof createSystemReferences>;
