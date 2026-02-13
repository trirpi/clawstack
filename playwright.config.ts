import { defineConfig, devices } from '@playwright/test'

const configuredWorkers = process.env.PLAYWRIGHT_WORKERS
  ? Number.parseInt(process.env.PLAYWRIGHT_WORKERS, 10)
  : NaN

const workerCount =
  Number.isFinite(configuredWorkers) && configuredWorkers > 0
    ? configuredWorkers
    : process.env.CI
      ? 8
      : undefined

export default defineConfig({
  testDir: './__tests__/e2e',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: workerCount,
  reporter: 'html',
  
  // Screenshot comparison settings - strict for catching visual regressions
  expect: {
    toHaveScreenshot: {
      // Allow only 1% pixel difference (was 5%)
      maxDiffPixelRatio: 0.01,
      // Per-pixel color threshold - lower = stricter (was 0.2)
      threshold: 0.1,
    },
  },
  
  // Don't auto-update snapshots in CI - fail instead
  updateSnapshots: process.env.CI ? 'none' : 'missing',
  
  // Snapshot settings
  snapshotDir: './__tests__/e2e/snapshots',
  snapshotPathTemplate: '{snapshotDir}/{testFileDir}/{testFileName}-snapshots/{arg}{ext}',
  
  // Output folder for test artifacts
  outputDir: './test-results',
  
  use: {
    baseURL: 'http://127.0.0.1:3101',
    // Keep diagnostics for failures/retries without overloading CI runners.
    trace: process.env.CI ? 'retain-on-failure' : 'on-first-retry',
    screenshot: 'only-on-failure',
    video: process.env.CI ? 'retain-on-failure' : 'off',
  },
  
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  
  webServer: {
    command: 'bash scripts/playwright-webserver.sh',
    url: 'http://127.0.0.1:3101',
    reuseExistingServer: process.env.PLAYWRIGHT_REUSE_SERVER === '1',
    timeout: 120000,
  },
})
