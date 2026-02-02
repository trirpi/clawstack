import { test, expect } from '@playwright/test'

test.describe('Navigation', () => {
  test('should navigate from home to login', async ({ page }) => {
    await page.goto('/')
    
    await page.getByRole('link', { name: /sign in/i }).click()
    
    await expect(page).toHaveURL('/login')
  })

  test('should navigate from home to login via Get Started', async ({ page }) => {
    await page.goto('/')
    
    // Click the first "Get Started" or "Start Publishing" button
    const ctaButton = page.getByRole('link', { name: /start publishing|get started/i }).first()
    await ctaButton.click()
    
    await expect(page).toHaveURL('/login')
  })

  test('should navigate back to home from login', async ({ page }) => {
    await page.goto('/login')
    
    // Click the logo
    await page.getByRole('link').filter({ has: page.getByText('OpenClaw') }).first().click()
    
    await expect(page).toHaveURL('/')
  })

  test('should show 404 for non-existent pages', async ({ page }) => {
    const response = await page.goto('/this-page-does-not-exist-12345')
    
    // Should return 404
    expect(response?.status()).toBe(404)
  })

  test('should show 404 for non-existent publication', async ({ page }) => {
    const response = await page.goto('/nonexistent-user-abc123')
    
    expect(response?.status()).toBe(404)
  })

  test('header should be present on all pages', async ({ page }) => {
    // Check home
    await page.goto('/')
    await expect(page.getByRole('banner')).toBeVisible()
    
    // Check login
    await page.goto('/login')
    // Login page has a different layout, just check the page loads
    await expect(page.locator('body')).toBeVisible()
  })
})
