import * as authentik from '@pulumi/authentik';
import { akOpts } from '../../../utils';

export function createGoogleEnrollmentUserWriteStage(provider: authentik.Provider) {
  const stage = new authentik.StageUserWrite(
    'wendigo-google-enrollment-write',
    {
      name: 'Wendigo Google: create user',
      userCreationMode: 'always_create',
      userType: 'external',
      createUsersAsInactive: false,
      userPathTemplate: 'goauthentik.io/sources/%(slug)s',
    },
    akOpts(provider),
  );

  return { stage };
}

export type GoogleEnrollmentUserWriteStageResult = ReturnType<
  typeof createGoogleEnrollmentUserWriteStage
>;
