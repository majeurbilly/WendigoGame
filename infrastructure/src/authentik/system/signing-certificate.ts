import * as authentik from '@pulumi/authentik';
import { akInvokeOpts } from '../../utils';

/** Certificat RSA par défaut d'Authentik — requis pour des JWT RS256 + JWKS (validation backend). */
export function lookupAuthentikSelfSignedCertificate(provider: authentik.Provider) {
  return authentik.getCertificateKeyPairOutput(
    { name: 'authentik Self-signed Certificate' },
    akInvokeOpts(provider),
  );
}
