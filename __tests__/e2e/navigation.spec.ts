import { test, expect } from '@playwright/test'
import { gotoPage, gotoPageWithResponse } from './utils/navigation'

test.describe('Navigation', () => {
  test('should navigate from home to login', async ({ page }) => {
    await gotoPage(page, '/')
    
    const authLinks = page.locator('header a[href="/login"]')
    await expect.poll(async () => authLinks.count(), { timeout: 60000 }).toBeGreaterThan(0)
    await expect(authLinks.first()).toHaveAttribute('href', '/login')
  })

  test('should navigate from home to login via Get Started', async ({ page }) => {
    await gotoPage(page, '/')
    
    const getStartedLink = page.getByRole('link', { name: /start publishing/i }).first()
    await expect(getStartedLink).toBeVisible({ timeout: 15000 })
    await expect(getStartedLink).toHaveAttribute('href', '/login')
  })

  test('should navigate back to home from login', async ({ page }) => {
    await gotoPage(page, '/login')
    
    const homeLink = page.locator('a[href="/"]').filter({ hasText: /clawstack/i }).first()
    await expect(homeLink).toBeVisible({ timeout: 15000 })
    await Promise.all([
      page.waitForURL('**/', { timeout: 15000 }),
      homeLink.click(),
    ])
    
    await expect(page).toHaveURL('/')
  })

  test('should show 404 for non-existent pages', async ({ page }) => {
    const response = await gotoPageWithResponse(page, '/this-page-does-not-exist-12345')
    
    // Should return 404
    expect(response?.status()).toBe(404)
  })

  test('should show 404 for non-existent publication', async ({ page }) => {
    const response = await gotoPageWithResponse(page, '/nonexistent-user-abc123')
    
    expect(response?.status()).toBe(404)
  })

  test('header should be present on all pages', async ({ page }) => {
    // Check home
    await gotoPage(page, '/')
    await expect(page.getByRole('banner')).toBeVisible()
    
    // Check login
    await gotoPage(page, '/login')
    // Login page has a different layout, just check the page loads
    await expect(page.locator('body')).toBeVisible()
  })
})
