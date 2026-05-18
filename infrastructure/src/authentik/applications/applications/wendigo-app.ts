import * as authentik from '@pulumi/authentik';
import * as pulumi from '@pulumi/pulumi';
import { applicationName, applicationSlug, authentikBaseUrl, oidcClientId } from '../../../config';
import { akOpts } from '../../../utils';
import type { WendigoOidcProviderResult } from '../providers/wendigo-oidc';

export function createWendigoApplication(
  deps: {
    provider: authentik.Provider;
    oidc: WendigoOidcProviderResult;
  },
  opts?: pulumi.CustomResourceOptions,
) {
  const application = new authentik.Application(
    'wendigo-app',
    {
      name: applicationName,
      slug: applicationSlug,
      protocolProvider: deps.oidc.provider.id.apply((id) => {
        const n = Number.parseInt(String(id), 10);
        if (!Number.isFinite(n)) {
          throw new pulumi.RunError(
            'Invalid OIDC provider ID: import or create wendigo-oidc before wendigo-app.',
          );
        }
        return n;
      }),
      metaLaunchUrl: 'http://localhost:5173/',
      metaPublisher: 'Wendigo Game',
    },
    akOpts(deps.provider, {
      ...opts,
      protect: false,
      dependsOn: [deps.oidc.provider],
      ignoreChanges: ['applicationId', 'uuid', 'protocolProvider', ...(opts?.ignoreChanges ?? [])],
    }),
  );

  const oidcIssuerUrl = pulumi.interpolate`${authentikBaseUrl}/application/o/${applicationSlug}/`;
  const oidcClientIdOut = oidcClientId;
  const oidcProviderId = deps.oidc.provider.id;

  return { application, oidcIssuerUrl, oidcClientIdOut, oidcProviderId };
}

export type WendigoApplicationResult = ReturnType<typeof createWendigoApplication>;
