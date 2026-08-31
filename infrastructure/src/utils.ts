import type * as authentik from '@pulumi/authentik';
import type * as pulumi from '@pulumi/pulumi';

const authentikApiTimeouts: pulumi.CustomResourceOptions = {
  customTimeouts: { create: '20m', update: '20m', delete: '10m' },
};

function withAuthentikTimeouts(opts?: pulumi.CustomResourceOptions): pulumi.CustomResourceOptions {
  return {
    ...authentikApiTimeouts,
    ...opts,
    customTimeouts: { ...authentikApiTimeouts.customTimeouts, ...opts?.customTimeouts },
  };
}

export function akOpts(
  provider: authentik.Provider,
  opts?: pulumi.CustomResourceOptions,
): pulumi.CustomResourceOptions {
  return withAuthentikTimeouts({ provider, ...opts });
}

export function akInvokeOpts(provider: authentik.Provider): pulumi.InvokeOptions {
  return { provider };
}
