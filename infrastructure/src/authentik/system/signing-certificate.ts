import * as authentik from '@pulumi/authentik';
import * as tls from '@pulumi/tls';
import { akOpts } from '../../utils';

/** Certificat RSA dédié Wendigo — évite le lookup `getCertificateKeyPair` (fragile sur instance fraîche / CI). */
export function createWendigoOidcSigningCertificate(provider: authentik.Provider) {
  const privateKey = new tls.PrivateKey('wendigo-oidc-signing-key', {
    algorithm: 'RSA',
    rsaBits: 2048,
  });

  const selfSigned = new tls.SelfSignedCert(
    'wendigo-oidc-signing-cert',
    {
      privateKeyPem: privateKey.privateKeyPem,
      subject: {
        commonName: 'wendigo-oidc-signing',
        organization: 'Wendigo',
      },
      validityPeriodHours: 87600,
      allowedUses: ['keyEncipherment', 'digitalSignature'],
    },
    { dependsOn: [privateKey] },
  );

  return new authentik.CertificateKeyPair(
    'wendigo-oidc-signing',
    {
      name: 'Wendigo: OIDC Signing (RSA)',
      certificateData: selfSigned.certPem,
      keyData: privateKey.privateKeyPem,
    },
    akOpts(provider, { dependsOn: [selfSigned] }),
  );
}
