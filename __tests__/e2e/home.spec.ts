import { test, expect } from '@playwright/test'

test.describe('Home Page', () => {
  test('should display the landing page', async ({ page }) => {
    await page.goto('/')
    
    // Check that the page loads
    await expect(page).toHaveTitle(/OpenClaw/)
  })

  test('should have navigation elements', async ({ page }) => {
    await page.goto('/')
    
    // Check for main CTA buttons
    await expect(page.getByRole('link', { name: /get started/i })).toBeVisible()
  })

  test('should be responsive', async ({ page }) => {
    await page.goto('/')
    
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })
    await expect(page.locator('body')).toBeVisible()
    
    // Test desktop viewport
    await page.setViewportSize({ width: 1280, height: 720 })
    await expect(page.locator('body')).toBeVisible()
  })
})
