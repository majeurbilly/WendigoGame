import * as authentik from '@pulumi/authentik';
import { akOpts } from '../../../utils';
import type { SystemReferences } from '../../system/references';

export function bindSourceAuthenticationFlow(deps: {
  provider: authentik.Provider;
  system: SystemReferences;
  userLogin: { stage: authentik.StageUserLogin };
}) {
  const ssoPolicy = new authentik.PolicyExpression(
    'wendigo-source-auth-sso-policy',
    {
      name: 'Wendigo: source auth SSO only',
      expression: 'return ak_is_sso_flow',
    },
    akOpts(deps.provider),
  );

  const loginBinding = new authentik.FlowStageBinding(
    'wendigo-source-auth-login-binding',
    {
      target: deps.system.flows.sourceAuthentication.uuid,
      stage: deps.userLogin.stage.id,
      order: 0,
      reEvaluatePolicies: true,
    },
    akOpts(deps.provider),
  );

  new authentik.PolicyBinding(
    'wendigo-source-auth-sso-policy-binding',
    {
      target: deps.system.flows.sourceAuthentication.uuid,
      policy: ssoPolicy.id,
      order: 0,
      enabled: true,
    },
    akOpts(deps.provider),
  );

  return { loginBinding, ssoPolicy };
}

export type SourceAuthenticationBindingsResult = ReturnType<typeof bindSourceAuthenticationFlow>;
