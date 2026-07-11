const { defineConfig, devices } = require('@playwright/test');

/**
 * E2E contra el modo DEMO (determinista, sin red). Levanta la app con
 * NEXT_PUBLIC_DATA_BACKEND=demo y corre los flujos principales.
 */
module.exports = defineConfig({
  testDir: './e2e',
  timeout: 30_000,
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    env: { NEXT_PUBLIC_DATA_BACKEND: 'demo' },
  },
});
