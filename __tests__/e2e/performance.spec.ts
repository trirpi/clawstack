import { test, expect } from '@playwright/test'

test.describe('Performance', () => {
  test('home page should load within 5 seconds', async ({ page }) => {
    const startTime = Date.now()
    
    await page.goto('/')
    await page.waitForLoadState('domcontentloaded')
    
    const loadTime = Date.now() - startTime
    expect(loadTime).toBeLessThan(5000)
  })

  test('login page should load within 3 seconds', async ({ page }) => {
    const startTime = Date.now()
    
    await page.goto('/login')
    await page.waitForLoadState('domcontentloaded')
    
    const loadTime = Date.now() - startTime
    expect(loadTime).toBeLessThan(3000)
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
