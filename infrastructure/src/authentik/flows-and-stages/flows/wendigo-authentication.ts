import * as authentik from '@pulumi/authentik';
import { akOpts } from '../../../utils';

export function createWendigoAuthenticationFlow(provider: authentik.Provider) {
  const flow = new authentik.Flow(
    'wendigo-authentication',
    {
      name: 'Wendigo: Google Authentication',
      slug: 'wendigo-authentication',
      title: 'Wendigo: Sign In',
      designation: 'authentication',
      authentication: 'require_unauthenticated',
    },
    akOpts(provider),
  );

  return { flow };
}

export type WendigoAuthenticationFlowResult = ReturnType<typeof createWendigoAuthenticationFlow>;
