import * as authentik from '@pulumi/authentik'
import { akOpts } from '../../pulumi/provider-opts'

export function createGoogleEnrollmentFlow() {
  const flow = new authentik.Flow(
    'wendigo-google-enrollment',
    {
    name: 'Wendigo — Inscription Google',
    slug: 'wendigo-google-enrollment',
    title: 'Wendigo — Inscription Google',
    designation: 'enrollment',
    authentication: 'none',
    },
    akOpts()
  )

  return { flow }
}

export type GoogleEnrollmentFlowResult = ReturnType<typeof createGoogleEnrollmentFlow>
