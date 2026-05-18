import * as authentik from '@pulumi/authentik'
import { akOpts } from '../../pulumi/provider-opts'

/** Demande le username si absent du contexte OAuth (fallback blueprint default-source-enrollment). */
export function createGoogleEnrollmentPromptStage() {
  const usernameField = new authentik.StagePromptField(
    'wendigo-google-enrollment-username-field',
    {
      name: 'wendigo-google-enrollment-username',
      fieldKey: 'username',
      label: 'Nom d\'utilisateur',
      type: 'username',
      required: true,
      placeholder: 'Nom d\'utilisateur',
    },
    akOpts()
  )

  const stage = new authentik.StagePrompt(
    'wendigo-google-enrollment-prompt',
    {
      name: 'Wendigo Google — choix du username',
      fields: [usernameField.id],
    },
    akOpts()
  )

  return { stage, usernameField }
}

export type GoogleEnrollmentPromptStageResult = ReturnType<
  typeof createGoogleEnrollmentPromptStage
>
