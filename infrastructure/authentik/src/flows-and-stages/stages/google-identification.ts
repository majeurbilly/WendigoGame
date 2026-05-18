import * as authentik from '@pulumi/authentik'
import type * as pulumi from '@pulumi/pulumi'
import { akOpts } from '../../pulumi/provider-opts'

export function createWendigoIdentificationStage(
  deps: {
    googleSourceUuid: pulumi.Input<string>
  },
  opts?: pulumi.CustomResourceOptions
) {
  const stage = new authentik.StageIdentification(
    'wendigo-google-identification',
    {
    name: 'Wendigo — Connexion Google',
    sources: [deps.googleSourceUuid],
    userFields: [],
    showSourceLabels: false,
    enableRememberMe: false,
    },
    akOpts(opts)
  )

  return { stage }
}

export type WendigoIdentificationStageResult = ReturnType<typeof createWendigoIdentificationStage>
