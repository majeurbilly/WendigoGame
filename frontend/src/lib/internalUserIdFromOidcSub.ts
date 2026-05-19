import parse from '@/vendor/uuid/parse.js'
import stringify from '@/vendor/uuid/stringify.js'
import validate from '@/vendor/uuid/validate.js'
import v5 from '@/vendor/uuid/v5.js'
import { safeTrim } from '@/lib/safeTrim'

/** Aligné sur `auth.SubjectUUIDFromOIDCSub` (backend Go). */
const SUB_DERIVATION_PREFIX = 'wendigo:oidc-sub:v1:'
/** `uuid.NameSpaceURL` (github.com/google/uuid). */
const NAMESPACE_URL = '6ba7b811-9dad-11d1-80b4-00c04fd430c8'

/**
 * Même identifiant interne que le backend (lobby / WebSocket / Postgres) à partir du claim `sub` OIDC.
 */
export function internalUserIdFromOidcSub(sub: string): string {
  const s = safeTrim(sub)
  if (!s) {
    return ''
  }
  if (validate(s)) {
    return stringify(parse(s))
  }
  return v5(SUB_DERIVATION_PREFIX + s, NAMESPACE_URL)
}
