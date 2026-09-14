import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright system tests for Joomla (TypeScript).
 *
 * The install project must run first: later specs assume a configured CMS.
 * Workers stay at 1 because tests share one database, one configuration.php,
 * and an in-process insert-cleanup cache (same constraints as Cypress).
 */
export default defineConfig({
  testDir: './tests/System/playwright',
  fullyParallel: false,
  workers: 1,
  timeout: 60_000,
  expect: { timeout: 20_000 },
  retries: process.env.CI ? 1 : 0,
  reporter: [
    ['list'],
    ['html', { open: 'never', outputFolder: 'tests/System/output/playwright-report' }],
  ],
  outputDir: 'tests/System/output/playwright-results',
  use: {
    ...devices['Desktop Chrome'],
    baseURL: process.env.JOOMLA_TEST_BASE_URL || 'http://localhost/',
    viewport: { width: 1200, height: 1000 },
    ignoreHTTPSErrors: true,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'off',
    actionTimeout: 20_000,
    navigationTimeout: 30_000,
  },
  projects: [
    {
      name: 'install',
      testMatch: /install\/.*\.spec\.ts/,
    },
    {
      name: 'system',
      testMatch: /.*\.spec\.ts/,
      testIgnore: /install\/.*/,
      dependencies: ['install'],
    },
  ],
});
