import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './__tests__/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
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
    baseURL: 'http://localhost:3000',
    // Always record traces - can be viewed with `npx playwright show-trace`
    trace: 'on',
    // Always take screenshots
    screenshot: 'on',
    // Always record videos
    video: 'on',
  },
  
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: true,
    timeout: 120000,
  },
})
