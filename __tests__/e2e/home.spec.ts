import { test, expect } from '@playwright/test'

test.describe('Home Page', () => {
  test('should display the landing page with correct title', async ({ page }) => {
    await page.goto('/')
    
    await expect(page).toHaveTitle(/OpenClaw/)
  })

  test('should display hero section with main heading', async ({ page }) => {
    await page.goto('/')
    
    const heading = page.getByRole('heading', { level: 1 })
    await expect(heading).toBeVisible()
    await expect(heading).toContainText('OpenClaw')
  })

  test('should have Get Started CTA button', async ({ page }) => {
    await page.goto('/')
    
    const ctaButton = page.getByRole('link', { name: /start publishing|get started/i }).first()
    await expect(ctaButton).toBeVisible()
  })

  test('should display features section', async ({ page }) => {
    await page.goto('/')
    
    // Check for feature cards
    await expect(page.getByText('Rich Publishing')).toBeVisible()
    await expect(page.getByText('One-Click Install')).toBeVisible()
    await expect(page.getByText('Paid Subscriptions')).toBeVisible()
  })

  test('should display stats section', async ({ page }) => {
    await page.goto('/')
    
    await expect(page.getByText('Active Creators')).toBeVisible()
    await expect(page.getByText('Scripts Shared')).toBeVisible()
    await expect(page.getByText('Creator Earnings')).toBeVisible()
  })

  test('should have OpenClaw logo', async ({ page }) => {
    await page.goto('/')
    
    // Check logo is visible
    await expect(page.getByText('🦞').first()).toBeVisible()
  })

  test('should be responsive on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/')
    
    // Page should still load and display content
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  })

  test('should be responsive on tablet', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 })
    await page.goto('/')
    
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  })
})
