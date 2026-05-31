import * as pulumi from '@pulumi/pulumi';
import { applicationSlug, authentikBaseUrl, oidcClientId } from './src/config';
import { deploy } from './src/deploy';

const stack = deploy();

// Authentik OIDC
export const oidcProvider = stack.oidc.provider;
export const oidcIssuerUrl = pulumi.interpolate`${authentikBaseUrl}/application/o/${applicationSlug}/`;
export const oidcClientIdOut = oidcClientId;
export const oidcProviderId = stack.oidc.provider.id;
export const applicationSlugOut = applicationSlug;

export const profileScopeMapping = stack.scopeMappings?.profileScopeMapping;
export const oidcPropertyMappingIds = stack.scopeMappings?.oidcPropertyMappingIds;
export const googleProfileMapping = stack.googleProfileMapping.mapping;

export const googleSource = stack.google.source;
export const googleCallbackUri = stack.googleCallbackUri;
export const googleSourceId = stack.googleSourceId;

export const googleEnrollmentFlow = stack.googleEnrollment.flow;
export const wendigoAuthenticationFlow = stack.wendigoAuthentication.flow;
export const wendigoIdentificationStage = stack.wendigoIdentification.stage;

// Observability
export const prometheusDatasourceId = stack.datasources.prometheus.id;
export const lokiDatasourceId = stack.datasources.loki.id;
