import * as authentik from '@pulumi/authentik'
import { akOpts } from '../../pulumi/provider-opts'

export function createGoogleEnrollmentUserWriteStage() {
  const stage = new authentik.StageUserWrite(
    'wendigo-google-enrollment-write',
    {
    name: 'Wendigo Google — création utilisateur',
    userCreationMode: 'always_create',
    userType: 'external',
    createUsersAsInactive: false,
    userPathTemplate: 'goauthentik.io/sources/%(slug)s',
    },
    akOpts()
  )

  return { stage }
}

export type GoogleEnrollmentUserWriteStageResult = ReturnType<
  typeof createGoogleEnrollmentUserWriteStage
>
