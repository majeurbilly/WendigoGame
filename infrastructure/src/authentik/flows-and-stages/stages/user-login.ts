import * as authentik from '@pulumi/authentik';
import { akOpts } from '../../../utils';

export function createGoogleEnrollmentUserLoginStage(provider: authentik.Provider) {
  const stage = new authentik.StageUserLogin(
    'wendigo-google-enrollment-login',
    {
      name: 'Wendigo Google: post-enrollment login',
    },
    akOpts(provider),
  );

  return { stage };
}

export function createWendigoAuthUserLoginStage(provider: authentik.Provider) {
  const stage = new authentik.StageUserLogin(
    'wendigo-google-auth-login',
    {
      name: 'Wendigo: user session',
    },
    akOpts(provider),
  );

  return { stage };
}
