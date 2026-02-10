import { test, expect } from '@playwright/test'
import { gotoPage } from './utils/navigation'

test.describe('Home Page', () => {
  test('should display the landing page with correct title', async ({ page }) => {
    await gotoPage(page, '/')
    
    await expect(page).toHaveTitle(/Clawstack/)
  })

  test('should display hero section with main heading', async ({ page }) => {
    await gotoPage(page, '/')
    
    const heading = page.getByRole('heading', { level: 1 })
    await expect(heading).toBeVisible()
    await expect(heading).toContainText('Clawstack')
  })

  test('should have Get Started CTA button', async ({ page }) => {
    await gotoPage(page, '/')
    
    const ctaButton = page.getByRole('link', { name: /start publishing|get started/i }).first()
    await expect(ctaButton).toBeVisible()
  })

  test('should display features section', async ({ page }) => {
    await gotoPage(page, '/')
    
    // Check for feature cards
    await expect(page.getByRole('heading', { name: 'Rich Editor' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Access Controls' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Paid Subscriptions' })).toBeVisible()
  })

  test('should display stats section', async ({ page }) => {
    await gotoPage(page, '/')
    
    await expect(page.getByText('Post formats available now')).toBeVisible()
    await expect(page.getByText('Reader access modes')).toBeVisible()
    await expect(page.getByText('Publishing model')).toBeVisible()
  })

  test('should have Clawstack logo', async ({ page }) => {
    await gotoPage(page, '/')
    
    // Check logo is visible
    await expect(page.getByText('🦞').first()).toBeVisible()
  })

  test('should be responsive on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await gotoPage(page, '/')
    
    // Page should still load and display content
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  })

  test('should be responsive on tablet', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 })
    await gotoPage(page, '/')
    
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  })
})
