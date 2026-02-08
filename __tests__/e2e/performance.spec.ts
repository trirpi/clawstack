import { test, expect } from '@playwright/test'

test.describe('Performance', () => {
  const homeThresholdMs = process.env.CI ? 20000 : 7000
  const loginThresholdMs = process.env.CI ? 15000 : 5000

  test('home page should load within threshold', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('domcontentloaded')

    const navigationDuration = await page.evaluate(() => {
      const entry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined
      return entry?.duration ?? 0
    })

    expect(navigationDuration).toBeLessThan(homeThresholdMs)
  })

  test('login page should load within threshold', async ({ page }) => {
    await page.goto('/login')
    await page.waitForLoadState('domcontentloaded')

    const navigationDuration = await page.evaluate(() => {
      const entry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined
      return entry?.duration ?? 0
    })

    expect(navigationDuration).toBeLessThan(loginThresholdMs)
  })

  test('page should not have console errors', async ({ page }) => {
    const errors: string[] = []
    
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text())
      }
    })
    
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    
    // Filter out known acceptable errors (like missing favicon, etc.)
    const criticalErrors = errors.filter(err => 
      !err.includes('favicon') && 
      !err.includes('404') &&
      !err.includes('Failed to load resource')
    )
    
    expect(criticalErrors).toHaveLength(0)
  })

  test('page should not have JavaScript errors', async ({ page }) => {
    const errors: Error[] = []
    
    page.on('pageerror', error => {
      errors.push(error)
    })
    
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    
    expect(errors).toHaveLength(0)
  })

  test('page should have reasonable number of requests', async ({ page }) => {
    let requestCount = 0
    
    page.on('request', () => {
      requestCount++
    })
    
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    
    // Should not have excessive requests (adjust threshold as needed)
    expect(requestCount).toBeLessThan(100)
  })
})
