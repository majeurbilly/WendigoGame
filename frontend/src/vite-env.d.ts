/// <reference types="vite/client" />

declare module '*.po' {
  import type { Messages } from '@lingui/core'
  export const messages: Messages
}

interface ImportMetaEnv {
  /** Issuer OIDC Authentik (ex. https://authentik.example/application/o/wendigo/) */
  readonly VITE_AUTHENTIK_URL?: string
  /** Client OAuth2 « public » (SPA) enregistré dans Authentik */
  readonly VITE_AUTHENTIK_CLIENT_ID?: string
}
