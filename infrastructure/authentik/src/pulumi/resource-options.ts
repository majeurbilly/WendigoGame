import type * as pulumi from '@pulumi/pulumi'

/** Timeouts élargis — évite les erreurs « error reading from server: EOF » sur grosses requêtes API. */
export const authentikApiTimeouts: pulumi.CustomResourceOptions = {
  customTimeouts: {
    create: '20m',
    update: '20m',
    delete: '10m',
  },
}

export function withAuthentikTimeouts(
  opts?: pulumi.CustomResourceOptions
): pulumi.CustomResourceOptions {
  return {
    ...authentikApiTimeouts,
    ...opts,
    customTimeouts: {
      ...authentikApiTimeouts.customTimeouts,
      ...opts?.customTimeouts,
    },
  }
}
