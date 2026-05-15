/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Issuer OIDC Authentik (ex. https://authentik.example/application/o/wendigo/) */
  readonly VITE_AUTHENTIK_URL?: string
  /** Client OAuth2 « public » (SPA) enregistré dans Authentik */
  readonly VITE_AUTHENTIK_CLIENT_ID?: string
}
