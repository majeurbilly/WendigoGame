import { defineConfig } from '@lingui/cli'

export default defineConfig({
  sourceLocale: 'en',
  locales: ['en', 'fr'],
  macro: {
    corePackage: ['@lingui/core/macro', '@/lib/lingui'],
    jsxPackage: ['@lingui/react/macro', '@/lib/lingui'],
  },
  catalogs: [
    {
      path: '<rootDir>/src/locales/{locale}/messages',
      include: ['src'],
    },
  ],
})
