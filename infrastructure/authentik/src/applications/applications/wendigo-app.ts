import * as pulumi from '@pulumi/pulumi'
import * as authentik from '@pulumi/authentik'
import { applicationName, applicationSlug, authentikBaseUrl } from '../../config'
import type { WendigoOidcProviderResult } from '../providers/wendigo-oidc'
import { akOpts } from '../../pulumi/provider-opts'

export function createWendigoApplication(
  deps: { oidc: WendigoOidcProviderResult },
  opts?: pulumi.CustomResourceOptions
) {
  const application = new authentik.Application(
    'wendigo-app',
    {
    name: applicationName,
    slug: applicationSlug,
    protocolProvider: deps.oidc.provider.id.apply((id) => {
      const n = Number.parseInt(String(id), 10)
      if (!Number.isFinite(n)) {
        throw new pulumi.RunError(
          'ID provider OIDC invalide — importez ou créez wendigo-oidc avant wendigo-app.'
        )
      }
      return n
    }),
    metaLaunchUrl: 'http://localhost:5173/',
    metaPublisher: 'Wendigo Game',
    },
    akOpts({
      ...opts,
      protect: false,
      dependsOn: [deps.oidc.provider],
      ignoreChanges: [
        'applicationId',
        'uuid',
        'protocolProvider',
        ...(opts?.ignoreChanges ?? []),
      ],
    })
  )

  const oidcIssuerUrl = pulumi.interpolate`${authentikBaseUrl}/application/o/${applicationSlug}/`
  const oidcClientIdOut = deps.oidc.provider.clientId
  const oidcProviderId = deps.oidc.provider.id

  return { application, oidcIssuerUrl, oidcClientIdOut, oidcProviderId }
}

export type WendigoApplicationResult = ReturnType<typeof createWendigoApplication>
