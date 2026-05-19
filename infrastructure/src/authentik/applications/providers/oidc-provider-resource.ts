import * as pulumi from '@pulumi/pulumi';

interface OidcProviderInputs {
  authentikUrl: string;
  authentikToken: string;
  name: string;
  clientId: string;
  clientType: string;
  authorizationFlow: string;
  invalidationFlow: string;
  authenticationFlow: string;
  signingKey: string;
  redirectUris: Array<{ matchingMode: string; url: string }>;
  issuerMode: string;
  subMode: string;
  propertyMappings?: string[];
  includeClaimsInIdToken?: boolean;
  accessTokenValidity?: string;
  refreshTokenValidity?: string;
}

interface OidcProviderOutputs extends OidcProviderInputs {
  pk: number;
  clientSecret: string;
}

function toApiBody(inputs: OidcProviderInputs): Record<string, unknown> {
  const body: Record<string, unknown> = {
    name: inputs.name,
    client_id: inputs.clientId,
    client_type: inputs.clientType,
    authorization_flow: inputs.authorizationFlow,
    invalidation_flow: inputs.invalidationFlow,
    authentication_flow: inputs.authenticationFlow,
    signing_key: inputs.signingKey,
    redirect_uris: inputs.redirectUris.map((u) => ({
      matching_mode: u.matchingMode,
      url: u.url,
    })),
    issuer_mode: inputs.issuerMode,
    sub_mode: inputs.subMode,
  };
  if (inputs.propertyMappings?.length) body.property_mappings = inputs.propertyMappings;
  if (inputs.includeClaimsInIdToken !== undefined)
    body.include_claims_in_id_token = inputs.includeClaimsInIdToken;
  if (inputs.accessTokenValidity) body.access_token_validity = inputs.accessTokenValidity;
  if (inputs.refreshTokenValidity) body.refresh_token_validity = inputs.refreshTokenValidity;
  return body;
}

async function apiRequest(
  url: string,
  token: string,
  method: string,
  body?: unknown,
): Promise<Response> {
  const headers: Record<string, string> = { Authorization: `Bearer ${token}` };
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  return fetch(url, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
}

// If the POST drops the connection (Authentik EOF bug), check whether the resource
// was actually created before the server closed the socket.
async function findByClientId(
  base: string,
  token: string,
  clientId: string,
): Promise<number | undefined> {
  const res = await apiRequest(
    `${base}/api/v3/providers/oauth2/?client_id=${encodeURIComponent(clientId)}`,
    token,
    'GET',
  );
  if (!res.ok) return undefined;
  const data = (await res.json()) as { results: Array<{ pk: number }> };
  return data.results[0]?.pk;
}

const oidcProviderResourceImpl: pulumi.dynamic.ResourceProvider = {
  async create(inputs: OidcProviderInputs) {
    const { authentikUrl: base, authentikToken: token } = inputs;
    let pk: number | undefined;
    let clientSecret = '';

    try {
      const res = await apiRequest(
        `${base}/api/v3/providers/oauth2/`,
        token,
        'POST',
        toApiBody(inputs),
      );
      if (res.ok) {
        const data = (await res.json()) as { pk: number; client_secret: string };
        pk = data.pk;
        clientSecret = data.client_secret ?? '';
      } else {
        throw new Error(`Authentik API ${res.status}: ${await res.text()}`);
      }
    } catch {
      // POST failed â€” Authentik may have created the provider before dropping the connection.
      pk = await findByClientId(base, token, inputs.clientId);
    }

    if (pk === undefined) {
      throw new Error(
        `Failed to create OIDC provider "${inputs.name}" and no existing provider found with client_id "${inputs.clientId}".`,
      );
    }

    return {
      id: String(pk),
      outs: { ...inputs, pk, clientSecret } satisfies OidcProviderOutputs,
    };
  },

  async read(id: string, props: OidcProviderOutputs) {
    const res = await apiRequest(
      `${props.authentikUrl}/api/v3/providers/oauth2/${id}/`,
      props.authentikToken,
      'GET',
    );
    if (res.status === 404) return { id: '', props };
    if (!res.ok) throw new Error(`Authentik API ${res.status}`);
    const data = (await res.json()) as { pk: number };
    return { id, props: { ...props, pk: data.pk } };
  },

  async update(id: string, _olds: OidcProviderInputs, news: OidcProviderInputs) {
    const { authentikUrl: base, authentikToken: token } = news;
    const res = await apiRequest(
      `${base}/api/v3/providers/oauth2/${id}/`,
      token,
      'PATCH',
      toApiBody(news),
    );
    if (!res.ok) throw new Error(`Authentik API ${res.status}: ${await res.text()}`);
    const data = (await res.json()) as { pk: number; client_secret: string };
    return { outs: { ...news, pk: data.pk, clientSecret: data.client_secret ?? '' } };
  },

  async delete(id: string, props: OidcProviderOutputs) {
    const res = await apiRequest(
      `${props.authentikUrl}/api/v3/providers/oauth2/${id}/`,
      props.authentikToken,
      'DELETE',
    );
    if (!res.ok && res.status !== 404) {
      throw new Error(`Authentik API ${res.status}`);
    }
  },
};

export interface OidcProviderResourceArgs {
  authentikUrl: pulumi.Input<string>;
  authentikToken: pulumi.Input<string>;
  name: pulumi.Input<string>;
  clientId: pulumi.Input<string>;
  clientType: pulumi.Input<string>;
  authorizationFlow: pulumi.Input<string>;
  invalidationFlow: pulumi.Input<string>;
  authenticationFlow: pulumi.Input<string>;
  signingKey: pulumi.Input<string>;
  redirectUris: pulumi.Input<Array<{ matchingMode: string; url: string }>>;
  issuerMode: pulumi.Input<string>;
  subMode: pulumi.Input<string>;
  propertyMappings?: pulumi.Input<string[]>;
  includeClaimsInIdToken?: pulumi.Input<boolean>;
  accessTokenValidity?: pulumi.Input<string>;
  refreshTokenValidity?: pulumi.Input<string>;
}

export class OidcProviderResource extends pulumi.dynamic.Resource {
  public readonly pk!: pulumi.Output<number>;
  public readonly clientSecret!: pulumi.Output<string>;

  constructor(name: string, args: OidcProviderResourceArgs, opts?: pulumi.CustomResourceOptions) {
    super(
      oidcProviderResourceImpl,
      name,
      { pk: undefined, clientSecret: undefined, ...args },
      opts,
    );
  }
}
