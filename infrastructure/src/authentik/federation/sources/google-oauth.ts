import * as authentik from '@pulumi/authentik';
import type * as pulumi from '@pulumi/pulumi';
import { googleClientId, googleClientSecret } from '../../../config';
import { akOpts } from '../../../utils';
import type { GoogleProfileMappingResult } from '../../customization/property-mappings/google-profile';
import type { GoogleEnrollmentFlowResult } from '../../flows-and-stages/flows/google-enrollment';

export function createGoogleSource(
  deps: {
    provider: authentik.Provider;
    defaultSourceAuthenticationFlowUuid: pulumi.Input<string>;
    enrollment: GoogleEnrollmentFlowResult;
    profileMapping: GoogleProfileMappingResult;
  },
  opts?: pulumi.CustomResourceOptions,
) {
  const source = new authentik.SourceOauth(
    'wendigo-google-source',
    {
      name: 'Google',
      slug: 'google',
      providerType: 'google',
      consumerKey: googleClientId,
      consumerSecret: googleClientSecret,
      enabled: true,
      promoted: true,
      userMatchingMode: 'identifier',
      userPathTemplate: 'goauthentik.io/sources/%(slug)s',
      authenticationFlow: deps.defaultSourceAuthenticationFlowUuid,
      enrollmentFlow: deps.enrollment.flow.uuid,
      propertyMappings: [deps.profileMapping.mapping.id],
    },
    akOpts(deps.provider, opts),
  );

  return { source };
}

export type GoogleSourceResult = ReturnType<typeof createGoogleSource>;
