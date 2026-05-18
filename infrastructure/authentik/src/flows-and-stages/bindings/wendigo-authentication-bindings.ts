import * as authentik from '@pulumi/authentik'
import { akOpts } from '../../pulumi/provider-opts'
import type { WendigoAuthenticationFlowResult } from '../flows/wendigo-authentication'
import type { WendigoIdentificationStageResult } from '../stages/google-identification'

export function bindWendigoAuthenticationFlow(deps: {
  authentication: WendigoAuthenticationFlowResult
  identification: WendigoIdentificationStageResult
  userLogin: { stage: authentik.StageUserLogin }
}
) {
  const identificationBinding = new authentik.FlowStageBinding(
    'wendigo-auth-identification-binding',
    {
      target: deps.authentication.flow.uuid,
      stage: deps.identification.stage.id,
      order: 10,
    },
    akOpts()
  )

  const loginBinding = new authentik.FlowStageBinding(
    'wendigo-auth-login-binding',
    {
      target: deps.authentication.flow.uuid,
      stage: deps.userLogin.stage.id,
      order: 100,
    },
    akOpts()
  )

  return { identificationBinding, loginBinding }
}
