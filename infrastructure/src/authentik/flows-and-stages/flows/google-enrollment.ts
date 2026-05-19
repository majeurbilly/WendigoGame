import * as authentik from '@pulumi/authentik';
import { akOpts } from '../../../utils';

export function createGoogleEnrollmentFlow(provider: authentik.Provider) {
  const flow = new authentik.Flow(
    'wendigo-google-enrollment',
    {
      name: 'Wendigo: Google Enrollment',
      slug: 'wendigo-google-enrollment',
      title: 'Wendigo: Google Enrollment',
      designation: 'enrollment',
      authentication: 'none',
    },
    akOpts(provider),
  );

  return { flow };
}

export type GoogleEnrollmentFlowResult = ReturnType<typeof createGoogleEnrollmentFlow>;
