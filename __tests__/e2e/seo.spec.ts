import { test, expect } from '@playwright/test'

test.describe('SEO', () => {
  test('home page should have proper meta title', async ({ page }) => {
    await page.goto('/')
    
    const title = await page.title()
    expect(title).toContain('Clawstack')
  })

  test('home page should have meta description', async ({ page }) => {
    await page.goto('/')
    
    const metaDescription = await page.locator('meta[name="description"]').getAttribute('content')
    expect(metaDescription).toBeTruthy()
    expect(metaDescription?.length).toBeGreaterThan(50)
  })

  test('login page should have proper title', async ({ page }) => {
    await page.goto('/login')
    
    // Page should have a title
    const title = await page.title()
    expect(title).toBeTruthy()
  })

  test('pages should have proper lang attribute', async ({ page }) => {
    await page.goto('/')
    
    const lang = await page.locator('html').getAttribute('lang')
    expect(lang).toBe('en')
  })

  test('pages should have viewport meta tag', async ({ page }) => {
    await page.goto('/')
    
    const viewport = await page.locator('meta[name="viewport"]').getAttribute('content')
    expect(viewport).toContain('width=device-width')
  })
})
