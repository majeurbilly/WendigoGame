import type * as pulumi from '@pulumi/pulumi';
import { oidcIncludePropertyMappings } from './config';
import { createWendigoOidcProvider } from './authentik/applications/providers/wendigo-oidc';
import { createWendigoApplication } from './authentik/applications/applications/wendigo-app';
import { createGoogleEnrollmentPolicies } from './authentik/customization/policies/google-enrollment';
import { createGoogleProfileMapping } from './authentik/customization/property-mappings/google-profile';
import { createOidcScopeMappings } from './authentik/customization/property-mappings/oauth-scopes';
import { createGoogleSource } from './authentik/federation/sources/google-oauth';
import { bindGoogleEnrollmentFlow } from './authentik/flows-and-stages/bindings/google-enrollment-bindings';
import { bindSourceAuthenticationFlow } from './authentik/flows-and-stages/bindings/source-authentication-bindings';
import { bindWendigoAuthenticationFlow } from './authentik/flows-and-stages/bindings/wendigo-authentication-bindings';
import { createGoogleEnrollmentFlow } from './authentik/flows-and-stages/flows/google-enrollment';
import { createWendigoAuthenticationFlow } from './authentik/flows-and-stages/flows/wendigo-authentication';
import { createGoogleEnrollmentPromptStage } from './authentik/flows-and-stages/stages/enrollment-prompt';
import { createWendigoIdentificationStage } from './authentik/flows-and-stages/stages/google-identification';
import {
  createGoogleEnrollmentUserLoginStage,
  createGoogleSourceAuthUserLoginStage,
  createWendigoAuthUserLoginStage,
} from './authentik/flows-and-stages/stages/user-login';
import { createGoogleEnrollmentUserWriteStage } from './authentik/flows-and-stages/stages/user-write';
// Authentik
import { createSystemReferences, flowUuidFromLookup } from './authentik/system/references';
import {
  createAuthentikProvider,
  prometheusConfigPath,
  prometheusReloadUrl,
} from './config';

// Observability
import { createDotEnv } from './docker-env';
import { PrometheusConfigResource } from './observability/prometheus/config-resource';
import { renderPrometheusYaml } from './observability/prometheus/scrape-config';

export function deploy() {
  // Authentik
  const authentikProvider = createAuthentikProvider();
  const system = createSystemReferences(authentikProvider);

  const sourceAuthUserLogin = createGoogleSourceAuthUserLoginStage(authentikProvider);
  const sourceAuthenticationBindings = bindSourceAuthenticationFlow({
    provider: authentikProvider,
    system,
    userLogin: sourceAuthUserLogin,
  });

  const scopeMappings = oidcIncludePropertyMappings
    ? createOidcScopeMappings(system, authentikProvider)
    : undefined;
  const googleProfileMapping = createGoogleProfileMapping(authentikProvider);
  const enrollmentPolicies = createGoogleEnrollmentPolicies(authentikProvider);

  const googleEnrollment = createGoogleEnrollmentFlow(authentikProvider);
  const enrollmentPrompt = createGoogleEnrollmentPromptStage(authentikProvider);
  const enrollmentUserWrite = createGoogleEnrollmentUserWriteStage(authentikProvider);
  const enrollmentUserLogin = createGoogleEnrollmentUserLoginStage(authentikProvider);

  const enrollmentBindings = bindGoogleEnrollmentFlow({
    provider: authentikProvider,
    enrollment: googleEnrollment,
    prompt: enrollmentPrompt,
    userWrite: enrollmentUserWrite,
    userLogin: enrollmentUserLogin,
    policies: enrollmentPolicies,
  });

  const google = createGoogleSource(
    {
      provider: authentikProvider,
      defaultSourceAuthenticationFlowUuid: system.flows.sourceAuthentication.uuid,
      enrollment: googleEnrollment,
      profileMapping: googleProfileMapping,
    },
    {
      dependsOn: [
        system.flows.sourceAuthentication,
        sourceAuthUserLogin.stage,
        sourceAuthenticationBindings.loginBinding,
        sourceAuthenticationBindings.ssoPolicy,
        googleEnrollment.flow,
        enrollmentPrompt.stage,
        enrollmentUserWrite.stage,
        enrollmentUserLogin.stage,
        enrollmentBindings.promptBinding,
        enrollmentBindings.writeBinding,
      ],
    },
  );

  const wendigoAuthentication = createWendigoAuthenticationFlow(authentikProvider);
  const wendigoIdentification = createWendigoIdentificationStage(
    { provider: authentikProvider, googleSourceUuid: google.source.uuid },
    { dependsOn: [google.source] },
  );
  const wendigoAuthUserLogin = createWendigoAuthUserLoginStage(authentikProvider);

  const authBindings = bindWendigoAuthenticationFlow({
    provider: authentikProvider,
    authentication: wendigoAuthentication,
    identification: wendigoIdentification,
    userLogin: wendigoAuthUserLogin,
  });

  const oidcDependsOn: pulumi.Resource[] = [
    system.flows.authorization,
    system.flows.invalidation,
    google.source,
    wendigoAuthentication.flow,
    wendigoIdentification.stage,
    wendigoAuthUserLogin.stage,
    authBindings.identificationBinding,
    authBindings.loginBinding,
  ];
  if (oidcIncludePropertyMappings && scopeMappings) {
    oidcDependsOn.push(scopeMappings.profileScopeMapping);
  }

  const oidc = createWendigoOidcProvider(
    { provider: authentikProvider, system, scopeMappings, authentication: wendigoAuthentication },
    { dependsOn: oidcDependsOn },
  );

  const wendigoApp = createWendigoApplication(
    { provider: authentikProvider, oidc },
    { dependsOn: [oidc.provider] },
  );

  // Observability — Grafana datasources: provisionnés via deploy/grafana/provisioning (Zéro ClickOps)
  const prometheusConfig = new PrometheusConfigResource('prometheus-config', {
    configPath: prometheusConfigPath,
    reloadUrl: prometheusReloadUrl,
    content: renderPrometheusYaml({
      scrapeIntervalSeconds: 15,
      evaluationIntervalSeconds: 15,
      scrapeJobs: [
        { name: 'prometheus', targets: ['localhost:9090'] },
        { name: 'cadvisor', targets: ['cadvisor:8080'], metricsPath: '/metrics' },
        { name: 'backend', targets: ['backend:8080'], metricsPath: '/metrics' },
      ],
    }),
  });

  // Docker Compose environment file — single source of truth for all container secrets
  const dotEnv = createDotEnv();

  return {
    system,
    scopeMappings,
    googleProfileMapping,
    googleEnrollment,
    enrollmentPolicies,
    enrollmentBindings,
    google,
    wendigoAuthentication,
    wendigoIdentification,
    authBindings,
    oidc,
    wendigoApp,
    googleCallbackUri: google.source.callbackUri,
    googleSourceId: google.source.id,
    prometheusConfig,
    dotEnv,
  };
}

export type DeployResult = ReturnType<typeof deploy>;
