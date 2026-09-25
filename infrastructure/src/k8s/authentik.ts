/**
 * Authentik via chart Helm officiel — Postgres/Redis partagés du namespace wendigo.
 * Pas de Postgres/Redis Bitnami embarqués (postgresql.enabled / redis.enabled = false).
 */
import * as crypto from 'node:crypto';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as k8s from '@pulumi/kubernetes';
import * as pulumi from '@pulumi/pulumi';

const AUTHENTIK_DB_NAME = 'authentik';
const AUTHENTIK_DB_USER = 'authentik';

export interface AuthentikHelmArgs {
  /** Namespace Kubernetes (défaut: wendigo). */
  namespace?: string;
}

export interface AuthentikHelmResult {
  release: k8s.helm.v3.Release;
  credentials: k8s.core.v1.Secret;
  dbInit: k8s.batch.v1.Job;
  blueprint: k8s.core.v1.ConfigMap;
  namespace: string;
  /** URL ClusterIP (pods du cluster). */
  internalUrl: string;
  /** URL LAN via NodePort (Pulumi / navigateurs hors cluster). */
  publicUrl: pulumi.Output<string>;
  ingressHost: string;
}

function resolveBlueprintPath(): string {
  const candidates = [
    path.resolve(process.cwd(), '../authentik/blueprints/wendigo-oidc.yaml'),
    path.resolve(process.cwd(), 'authentik/blueprints/wendigo-oidc.yaml'),
    path.resolve(__dirname, '../../../authentik/blueprints/wendigo-oidc.yaml'),
  ];
  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) {
      return candidate;
    }
  }
  throw new Error(
    `Blueprint OIDC introuvable. Cherché: ${candidates.join(', ')}`,
  );
}

export function deployAuthentikHelm(args: AuthentikHelmArgs = {}): AuthentikHelmResult {
  const wendigo = new pulumi.Config('wendigo');
  const namespace = args.namespace ?? wendigo.get('namespace') ?? 'wendigo';

  const secretKey = wendigo.requireSecret('authentikSecretKey');
  const authentikPgPass = wendigo.requireSecret('authentikPgPass');
  const bootstrapPassword = wendigo.requireSecret('authentikBootstrapPassword');
  const bootstrapToken = wendigo.requireSecret('authentikBootstrapToken');
  const bootstrapEmail =
    wendigo.get('authentikBootstrapEmail') ?? 'admin@stringempty.dev';
  const postgresAdminPassword = wendigo.requireSecret('pgPassword');

  const postgresHost = wendigo.get('postgresHost') ?? 'postgres';
  const postgresAdminUser = wendigo.get('postgresAdminUser') ?? 'wendigo';
  const redisHost = wendigo.get('redisHost') ?? 'redis';
  const ingressHost = wendigo.get('authentikIngressHost') ?? 'auth.wendigo.local';
  const nodePortHttp = wendigo.getNumber('authentikNodePort') ?? 30900;
  const chartVersion = wendigo.get('authentikChartVersion') ?? '2024.12.3';
  const publicBaseUrl =
    wendigo.get('authentikPublicUrl') ?? `http://192.168.0.157:${nodePortHttp}`;

  const credentials = new k8s.core.v1.Secret('authentik-credentials', {
    metadata: {
      name: 'authentik-credentials',
      namespace,
      labels: {
        'app.kubernetes.io/name': 'authentik',
        'app.kubernetes.io/part-of': 'wendigo',
        'app.kubernetes.io/component': 'credentials',
      },
    },
    stringData: {
      // Clés attendues par le chart (file:///postgres-creds/…)
      username: AUTHENTIK_DB_USER,
      password: authentikPgPass,
      'secret-key': secretKey,
      'bootstrap-password': bootstrapPassword,
      'bootstrap-token': bootstrapToken,
      'bootstrap-email': bootstrapEmail,
    },
    type: 'Opaque',
  });

  const passFingerprint = authentikPgPass.apply((pass) =>
    crypto.createHash('sha256').update(pass).digest('hex').slice(0, 16),
  );

  const dbInit = new k8s.batch.v1.Job(
    'authentik-db-init',
    {
      metadata: {
        name: 'authentik-db-init',
        namespace,
        labels: {
          'app.kubernetes.io/name': 'authentik',
          'app.kubernetes.io/part-of': 'wendigo',
          'app.kubernetes.io/component': 'db-init',
        },
        annotations: {
          'wendigo.game/db-pass-fingerprint': passFingerprint,
        },
      },
      spec: {
        ttlSecondsAfterFinished: 600,
        backoffLimit: 6,
        template: {
          metadata: {
            labels: {
              'app.kubernetes.io/name': 'authentik',
              'app.kubernetes.io/component': 'db-init',
            },
          },
          spec: {
            restartPolicy: 'OnFailure',
            containers: [
              {
                name: 'create-authentik-db',
                image: 'postgres:15-alpine',
                env: [
                  { name: 'PGHOST', value: postgresHost },
                  { name: 'PGPORT', value: '5432' },
                  { name: 'PGUSER', value: postgresAdminUser },
                  { name: 'PGPASSWORD', value: postgresAdminPassword },
                  { name: 'PGDATABASE', value: 'postgres' },
                  { name: 'AUTHENTIK_DB_PASS', value: authentikPgPass },
                ],
                command: [
                  'sh',
                  '-ec',
                  [
                    'set -eu',
                    // Escape single quotes for SQL literals
                    `PASS_SQL=$(printf "%s" "$AUTHENTIK_DB_PASS" | sed "s/'/''/g")`,
                    `if ! psql -tAc "SELECT 1 FROM pg_roles WHERE rolname='${AUTHENTIK_DB_USER}'" | grep -q 1; then`,
                    `  psql -v ON_ERROR_STOP=1 -c "CREATE ROLE ${AUTHENTIK_DB_USER} LOGIN PASSWORD '$PASS_SQL'"`,
                    'else',
                    `  psql -v ON_ERROR_STOP=1 -c "ALTER ROLE ${AUTHENTIK_DB_USER} WITH PASSWORD '$PASS_SQL'"`,
                    'fi',
                    `if ! psql -tAc "SELECT 1 FROM pg_database WHERE datname='${AUTHENTIK_DB_NAME}'" | grep -q 1; then`,
                    `  psql -v ON_ERROR_STOP=1 -c "CREATE DATABASE ${AUTHENTIK_DB_NAME} OWNER ${AUTHENTIK_DB_USER}"`,
                    'fi',
                  ].join('\n'),
                ],
              },
            ],
          },
        },
      },
    },
    {
      dependsOn: [credentials],
      deleteBeforeReplace: true,
    },
  );

  const blueprintYaml = fs.readFileSync(resolveBlueprintPath(), 'utf8');
  const blueprint = new k8s.core.v1.ConfigMap('wendigo-oidc-blueprint', {
    metadata: {
      name: 'wendigo-oidc-blueprint',
      namespace,
      labels: {
        'app.kubernetes.io/name': 'authentik',
        'app.kubernetes.io/part-of': 'wendigo',
        'app.kubernetes.io/component': 'blueprints',
      },
    },
    data: {
      'wendigo-oidc.yaml': blueprintYaml,
    },
  });

  const postgresCredVolume = {
    name: 'postgres-creds',
    secret: { secretName: 'authentik-credentials' },
  };
  const postgresCredMount = {
    name: 'postgres-creds',
    mountPath: '/postgres-creds',
    readOnly: true,
  };

  const bootstrapEnv = [
    {
      name: 'AUTHENTIK_SECRET_KEY',
      valueFrom: {
        secretKeyRef: { name: 'authentik-credentials', key: 'secret-key' },
      },
    },
    {
      name: 'AUTHENTIK_BOOTSTRAP_PASSWORD',
      valueFrom: {
        secretKeyRef: {
          name: 'authentik-credentials',
          key: 'bootstrap-password',
        },
      },
    },
    {
      name: 'AUTHENTIK_BOOTSTRAP_TOKEN',
      valueFrom: {
        secretKeyRef: {
          name: 'authentik-credentials',
          key: 'bootstrap-token',
        },
      },
    },
    {
      name: 'AUTHENTIK_BOOTSTRAP_EMAIL',
      valueFrom: {
        secretKeyRef: {
          name: 'authentik-credentials',
          key: 'bootstrap-email',
        },
      },
    },
  ];

  const release = new k8s.helm.v3.Release(
    'authentik',
    {
      name: 'authentik',
      chart: 'authentik',
      version: chartVersion,
      namespace,
      createNamespace: false,
      repositoryOpts: {
        repo: 'https://charts.goauthentik.io',
      },
      timeout: 600,
      skipAwait: false,
      values: {
        // Postgres / Redis Bitnami désactivés — instance centrale wendigo
        postgresql: { enabled: false },
        redis: { enabled: false },

        blueprints: {
          configMaps: ['wendigo-oidc-blueprint'],
        },

        authentik: {
          log_level: 'info',
          secret_key: secretKey,
          postgresql: {
            host: postgresHost,
            port: 5432,
            name: AUTHENTIK_DB_NAME,
            user: 'file:///postgres-creds/username',
            password: 'file:///postgres-creds/password',
          },
          redis: {
            host: redisHost,
          },
        },

        global: {
          volumeMounts: [postgresCredMount],
          volumes: [postgresCredVolume],
          env: bootstrapEnv.filter(
            (e) => e.name !== 'AUTHENTIK_SECRET_KEY',
          ),
        },

        server: {
          replicas: 1,
          service: {
            type: 'NodePort',
            nodePortHttp,
            servicePortHttp: 80,
          },
          // Ingress géré en Kustomize : deploy/k8s/apps/authentik-ingress.yaml
          // (host auth.wendigo.local → authentik-server:80) — évite un doublon Helm.
          ingress: {
            enabled: false,
          },
        },

        worker: {
          replicas: 1,
        },
      },
    },
    {
      dependsOn: [credentials, dbInit, blueprint],
    },
  );

  const internalUrl = `http://authentik-server.${namespace}.svc.cluster.local`;
  const publicUrl = pulumi.output(publicBaseUrl.replace(/\/+$/, ''));

  return {
    release,
    credentials,
    dbInit,
    blueprint,
    namespace,
    internalUrl,
    publicUrl,
    ingressHost,
  };
}
