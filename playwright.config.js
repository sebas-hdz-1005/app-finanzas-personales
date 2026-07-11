const { defineConfig, devices } = require('@playwright/test');

/**
 * E2E contra el modo DEMO (determinista, sin red). Levanta SU PROPIO servidor
 * en el puerto 3100 (independiente de un `npm run dev` que puedas tener en 3000),
 * forzando NEXT_PUBLIC_DATA_BACKEND=demo.
 */
const PORT = 3100;
const BASE_URL = `http://localhost:${PORT}`;

module.exports = defineConfig({
  testDir: './e2e',
  timeout: 45_000,
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: BASE_URL,
    trace: 'on-first-retry',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: `npm run dev -- --port ${PORT}`,
    url: BASE_URL,
    reuseExistingServer: false,
    timeout: 120_000,
    env: { NEXT_PUBLIC_DATA_BACKEND: 'demo' },
  },
});
