import { defineConfig, devices } from '@playwright/test';
import { env } from './config/env';

const allBrowsers = process.env.BROWSERS === 'all';
const uiMatch = /tests\/(ui|e2e)\/.*\.spec\.ts/;

export default defineConfig({
  testDir: './tests',
  timeout: 60_000,
  expect: { timeout: 10_000 },
  // Tests mutate shared seed state (drafts, submissions) so run serially by default.
  fullyParallel: false,
  workers: process.env.CI ? 1 : Number(process.env.WORKERS || 1),
  retries: process.env.CI ? 1 : 0, // retries are diagnostic only
  forbidOnly: !!process.env.CI,
  reporter: [
    ['list'],
    ['html', { open: 'never', outputFolder: 'playwright-report' }],
    ['junit', { outputFile: 'test-results/junit.xml' }],
  ],
  globalSetup: require.resolve('./global-setup'),
  use: {
    baseURL: env.baseUrl,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 15_000,
    navigationTimeout: 30_000,
    ignoreHTTPSErrors: true,
  },
  projects: [
    { name: 'setup', testMatch: /setup\/auth\.setup\.ts/ },
    {
      name: 'chromium',
      testMatch: uiMatch,
      use: { ...devices['Desktop Chrome'] },
      dependencies: ['setup'],
    },
    ...(allBrowsers
      ? [
          { name: 'firefox', testMatch: uiMatch, use: { ...devices['Desktop Firefox'] }, dependencies: ['setup'] },
          { name: 'webkit', testMatch: uiMatch, use: { ...devices['Desktop Safari'] }, dependencies: ['setup'] },
        ]
      : []),
    {
      name: 'api',
      testMatch: /tests\/api\/.*\.spec\.ts/,
      use: { baseURL: env.apiUrl },
    },
  ],
});
