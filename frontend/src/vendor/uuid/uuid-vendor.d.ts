declare module '@/vendor/uuid/v5.js' {
  const v5: (value: string, namespace: string) => string
  export default v5
}

declare module '@/vendor/uuid/validate.js' {
  const validate: (uuid: string) => boolean
  export default validate
}

declare module '@/vendor/uuid/parse.js' {
  const parse: (uuid: string) => Uint8Array
  export default parse
}

declare module '@/vendor/uuid/stringify.js' {
  export function unsafeStringify(arr: Uint8Array, offset?: number): string
  function stringify(arr: Uint8Array, offset?: number): string
  export default stringify
}
