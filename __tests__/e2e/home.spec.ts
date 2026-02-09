import { test, expect } from '@playwright/test'
import type { Page } from '@playwright/test'

async function gotoPage(page: Page, url: string) {
  let lastError: unknown

  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 })
      return
    } catch (error) {
      lastError = error
      const message = error instanceof Error ? error.message : String(error)
      if (!message.includes('ERR_NETWORK_IO_SUSPENDED') || attempt === 2) {
        throw error
      }
      await page.waitForTimeout(500 * (attempt + 1))
    }
  }

  throw lastError
}

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
    await expect(page.getByText('Rich Publishing')).toBeVisible()
    await expect(page.getByText('One-Click Install')).toBeVisible()
    await expect(page.getByText('Paid Subscriptions')).toBeVisible()
  })

  test('should display stats section', async ({ page }) => {
    await gotoPage(page, '/')
    
    await expect(page.getByText('Active Creators')).toBeVisible()
    await expect(page.getByText('Scripts Shared')).toBeVisible()
    await expect(page.getByText('Creator Earnings')).toBeVisible()
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
