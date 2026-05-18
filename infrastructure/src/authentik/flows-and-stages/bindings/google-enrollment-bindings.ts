import * as authentik from '@pulumi/authentik';
import { akOpts } from '../../../utils';
import type { GoogleEnrollmentPoliciesResult } from '../../customization/policies/google-enrollment';
import type { GoogleEnrollmentFlowResult } from '../flows/google-enrollment';
import type { GoogleEnrollmentPromptStageResult } from '../stages/enrollment-prompt';
import type { GoogleEnrollmentUserWriteStageResult } from '../stages/user-write';

type EnrollmentLoginStage = { stage: authentik.StageUserLogin };

export function bindGoogleEnrollmentFlow(deps: {
  provider: authentik.Provider;
  enrollment: GoogleEnrollmentFlowResult;
  prompt: GoogleEnrollmentPromptStageResult;
  userWrite: GoogleEnrollmentUserWriteStageResult;
  userLogin: EnrollmentLoginStage;
  policies: GoogleEnrollmentPoliciesResult;
}) {
  const { provider } = deps;

  const promptBinding = new authentik.FlowStageBinding(
    'wendigo-google-enrollment-prompt-binding',
    {
      target: deps.enrollment.flow.uuid,
      stage: deps.prompt.stage.id,
      order: 0,
    },
    akOpts(provider),
  );

  const writeBinding = new authentik.FlowStageBinding(
    'wendigo-google-enrollment-write-binding',
    {
      target: deps.enrollment.flow.uuid,
      stage: deps.userWrite.stage.id,
      order: 1,
      reEvaluatePolicies: true,
    },
    akOpts(provider),
  );

  new authentik.FlowStageBinding(
    'wendigo-google-enrollment-login-binding',
    {
      target: deps.enrollment.flow.uuid,
      stage: deps.userLogin.stage.id,
      order: 2,
    },
    akOpts(provider),
  );

  new authentik.PolicyBinding(
    'wendigo-google-enrollment-sso-binding',
    {
      target: deps.enrollment.flow.uuid,
      policy: deps.policies.ssoPolicy.id,
      order: 0,
      enabled: true,
    },
    akOpts(provider),
  );

  new authentik.PolicyBinding(
    'wendigo-google-enrollment-if-username-binding',
    {
      target: promptBinding.flowStageBindingId,
      policy: deps.policies.usernamePromptPolicy.id,
      order: 0,
      enabled: true,
    },
    akOpts(provider),
  );

  new authentik.PolicyBinding(
    'wendigo-google-enrollment-attributes-binding',
    {
      target: writeBinding.flowStageBindingId,
      policy: deps.policies.attributesPolicy.id,
      order: 0,
      enabled: true,
    },
    akOpts(provider),
  );

  return { promptBinding, writeBinding };
}
