import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';
import { getEnv } from './src/config/env';

dotenv.config();

export default defineConfig({
  testDir: './tests',
  timeout: 10000,
  expect: {
    timeout: 5000,
  },
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 1 : 1,
  reporter: [
    ['list'],
    ['html', { open: 'never' }],
    ['json', { outputFile: 'test-results/results.json' }],
  ],
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  use: {
    baseURL: getEnv('BASE_URL'),
    testIdAttribute: 'data-test',
    headless: true,
    trace: 'on',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
});
