import * as authentik from '@pulumi/authentik'
import { akOpts } from '../../pulumi/provider-opts'

export function createGoogleEnrollmentUserLoginStage() {
  const stage = new authentik.StageUserLogin(
    'wendigo-google-enrollment-login',
    {
    name: 'Wendigo Google — login post-inscription',
    },
    akOpts()
  )

  return { stage }
}

export function createWendigoAuthUserLoginStage() {
  const stage = new authentik.StageUserLogin(
    'wendigo-google-auth-login',
    {
      name: 'Wendigo — session utilisateur',
    },
    akOpts()
  )

  return { stage }
}
