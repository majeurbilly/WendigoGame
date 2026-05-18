import * as authentik from '@pulumi/authentik';
import type * as pulumi from '@pulumi/pulumi';
import { akOpts } from '../../../utils';

export function createWendigoIdentificationStage(
  deps: {
    provider: authentik.Provider;
    googleSourceUuid: pulumi.Input<string>;
  },
  opts?: pulumi.CustomResourceOptions,
) {
  const stage = new authentik.StageIdentification(
    'wendigo-google-identification',
    {
      name: 'Wendigo: Google sign-in',
      sources: [deps.googleSourceUuid],
      userFields: [],
      showSourceLabels: false,
      enableRememberMe: false,
    },
    akOpts(deps.provider, opts),
  );

  return { stage };
}

export type WendigoIdentificationStageResult = ReturnType<typeof createWendigoIdentificationStage>;
