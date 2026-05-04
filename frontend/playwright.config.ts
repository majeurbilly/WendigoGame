/// <reference types="node" />
import { defineConfig, devices } from '@playwright/test'

process.env.VITE_MOCK_LIVEKIT = process.env.VITE_MOCK_LIVEKIT ?? 'true'

export default defineConfig({
  testDir: './tests',
  fullyParallel: false,
  retries: 0,
  reporter: 'html',
  use: {
    baseURL: process.env.E2E_BASE_URL || 'http://127.0.0.1:5174',
    trace: 'on-first-retry',
    headless: true,
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: process.env.E2E_BASE_URL
    ? undefined
    : {
        command: 'pnpm dev --mode test --force --host 127.0.0.1 --port 5174',
        url: 'http://127.0.0.1:5174',
        reuseExistingServer: !process.env.CI,
        timeout: 120000,
        env: {
          VITE_MOCK_LIVEKIT: 'true',
        },
      },
})
