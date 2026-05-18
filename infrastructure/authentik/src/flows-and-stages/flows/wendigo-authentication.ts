import * as authentik from '@pulumi/authentik'
import { akOpts } from '../../pulumi/provider-opts'

export function createWendigoAuthenticationFlow() {
  const flow = new authentik.Flow(
    'wendigo-authentication',
    {
    name: 'Wendigo — Authentification Google',
    slug: 'wendigo-authentication',
    title: 'Connexion au Conseil',
    designation: 'authentication',
    authentication: 'require_unauthenticated',
    },
    akOpts()
  )

  return { flow }
}

export type WendigoAuthenticationFlowResult = ReturnType<typeof createWendigoAuthenticationFlow>
