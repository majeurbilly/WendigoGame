import * as authentik from '@pulumi/authentik';
import { akOpts } from '../../../utils';

export function createGoogleEnrollmentPromptStage(provider: authentik.Provider) {
  const usernameField = new authentik.StagePromptField(
    'wendigo-google-enrollment-username-field',
    {
      name: 'wendigo-google-enrollment-username',
      fieldKey: 'username',
      label: 'Username',
      type: 'username',
      required: true,
      placeholder: 'Username',
    },
    akOpts(provider),
  );

  const stage = new authentik.StagePrompt(
    'wendigo-google-enrollment-prompt',
    {
      name: 'Wendigo Google: choose username',
      fields: [usernameField.id],
    },
    akOpts(provider),
  );

  return { stage, usernameField };
}

export type GoogleEnrollmentPromptStageResult = ReturnType<
  typeof createGoogleEnrollmentPromptStage
>;
