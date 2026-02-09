import { test, expect } from '@playwright/test'

test.describe('Performance', () => {
  const homeThresholdMs = process.env.CI ? 30000 : 7000
  const loginThresholdMs = process.env.CI ? 25000 : 5000

  test('home page should load within threshold', async ({ page }) => {
    const startTime = Date.now()
    await page.goto('/', { waitUntil: 'domcontentloaded', timeout: 60000 })
    const navigationDuration = Date.now() - startTime

    expect(navigationDuration).toBeLessThan(homeThresholdMs)
  })

  test('login page should load within threshold', async ({ page }) => {
    const startTime = Date.now()
    await page.goto('/login', { waitUntil: 'domcontentloaded', timeout: 60000 })
    const navigationDuration = Date.now() - startTime

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
      !err.includes('Failed to load resource') &&
      !err.includes('[next-auth][error][CLIENT_FETCH_ERROR]')
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
