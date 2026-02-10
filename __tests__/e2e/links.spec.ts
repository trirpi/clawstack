import { test, expect } from '@playwright/test'
import { gotoPage } from './utils/navigation'

/**
 * These tests validate that ALL internal links in the app lead to working pages.
 * If a link is broken (404), the test will fail.
 */

test.describe('Link Validation', () => {
  test.describe('Navigation Links', () => {
    test('header explore link should work', async ({ page }) => {
      await gotoPage(page, '/')
      await page.getByRole('link', { name: /explore/i }).first().click()
      await expect(page).toHaveURL('/explore')
      await expect(page.getByRole('heading', { level: 1 })).toContainText('Explore')
    })

    test('header pricing link should work', async ({ page }) => {
      await gotoPage(page, '/')
      await page.getByRole('link', { name: /pricing/i }).first().click()
      await expect(page).toHaveURL('/pricing')
      await expect(page.getByRole('heading', { level: 1 })).toContainText('pricing')
    })

    test('header auth links should target login', async ({ page }) => {
      await gotoPage(page, '/')
      const authLinks = page.locator('header a[href="/login"]')
      await expect.poll(async () => authLinks.count(), { timeout: 15000 }).toBeGreaterThan(0)
      await expect(authLinks.first()).toHaveAttribute('href', '/login')
    })

    test('starter template should preserve callback through login redirect', async ({ page }) => {
      await gotoPage(page, '/explore')
      const templateLink = page.getByRole('link', { name: 'Use template' }).first()
      await expect(templateLink).toHaveAttribute('href', /\/dashboard\/new\?template=/)
      await templateLink.click()
      await expect(page).toHaveURL(/\/login\?callbackUrl=/)
    })
  })

  test.describe('Footer Links', () => {
    test('about link should work', async ({ page }) => {
      await gotoPage(page, '/')
      const footer = page.locator('footer')
      await footer.scrollIntoViewIfNeeded()
      await footer.getByRole('link', { name: /about/i }).click()
      await expect(page).toHaveURL('/about')
      await expect(page.getByRole('heading', { level: 1 })).toContainText('About')
    })

    test('pricing link in footer should work', async ({ page }) => {
      await gotoPage(page, '/')
      const footer = page.locator('footer')
      await footer.scrollIntoViewIfNeeded()
      await footer.getByRole('link', { name: /pricing/i }).click()
      await expect(page).toHaveURL('/pricing')
    })

    test('privacy link should work', async ({ page }) => {
      await gotoPage(page, '/')
      const footer = page.locator('footer')
      await footer.scrollIntoViewIfNeeded()
      await footer.getByRole('link', { name: /privacy/i }).click()
      await expect(page).toHaveURL('/privacy')
      await expect(page.getByRole('heading', { level: 1 })).toContainText('Privacy')
    })

    test('terms link should work', async ({ page }) => {
      await gotoPage(page, '/')
      const footer = page.locator('footer')
      await footer.scrollIntoViewIfNeeded()
      await footer.getByRole('link', { name: /terms/i }).click()
      await expect(page).toHaveURL('/terms')
      await expect(page.getByRole('heading', { level: 1 })).toContainText('Terms')
    })
  })

  test.describe('Hero Section Links', () => {
    test('start publishing button should work', async ({ page }) => {
      await gotoPage(page, '/')
      await page.getByRole('link', { name: /start publishing/i }).click()
      await expect(page).toHaveURL(/\/login\?callbackUrl=/)
    })

    test('explore content button should work', async ({ page }) => {
      await gotoPage(page, '/')
      await page.getByRole('link', { name: /explore content/i }).click()
      await expect(page).toHaveURL('/explore')
    })
  })

  test.describe('CTA Section Links', () => {
    test('create your publication button should work', async ({ page }) => {
      await gotoPage(page, '/')
      // Scroll to CTA section
      await page.getByText('Ready to share your automations').scrollIntoViewIfNeeded()
      await page.getByRole('link', { name: /create your publication/i }).click()
      await expect(page).toHaveURL(/\/login\?callbackUrl=/)
    })
  })

  test.describe('Login Page Links', () => {
    test('terms link on login should work', async ({ page }) => {
      await gotoPage(page, '/login')
      await page.getByRole('link', { name: /terms of service/i }).click()
      await expect(page).toHaveURL('/terms')
    })

    test('privacy link on login should work', async ({ page }) => {
      await gotoPage(page, '/login')
      await page.getByRole('link', { name: /privacy policy/i }).click()
      await expect(page).toHaveURL('/privacy')
    })

    test('logo link on login should go home', async ({ page }) => {
      await gotoPage(page, '/login')
      const logoLink = page.locator('a[href="/"]').filter({ hasText: /clawstack/i }).first()
      await expect(logoLink).toBeVisible({ timeout: 15000 })
      await Promise.all([
        page.waitForURL('**/', { timeout: 15000 }),
        logoLink.click(),
      ])
      await expect(page).toHaveURL('/', { timeout: 15000 })
    })
  })

  test.describe('Pricing Page Links', () => {
    test('get started button should work', async ({ page }) => {
      await gotoPage(page, '/pricing')
      await page.getByRole('main').getByRole('link', { name: /get started/i }).click()
      await expect(page).toHaveURL(/\/login\?callbackUrl=/)
    })

    test('start earning button should work', async ({ page }) => {
      await gotoPage(page, '/pricing')
      await page.getByRole('link', { name: /start earning/i }).click()
      await expect(page).toHaveURL(/\/login\?callbackUrl=/)
    })
  })
})

test.describe('Page Load Validation', () => {
  const pages = [
    { path: '/', title: 'Clawstack' },
    { path: '/login', title: 'Clawstack' },
    { path: '/explore', title: 'Explore' },
    { path: '/pricing', title: 'Pricing' },
    { path: '/about', title: 'About' },
    { path: '/privacy', title: 'Privacy' },
    { path: '/terms', title: 'Terms' },
  ]

  for (const { path, title } of pages) {
    test(`${path} should load without errors`, async ({ page }) => {
      const errors: string[] = []
      page.on('pageerror', error => errors.push(error.message))
      
      const response = await page.goto(path, { waitUntil: 'domcontentloaded', timeout: 60000 })
      
      // Page should return 200
      expect(response?.status()).toBe(200)
      
      // Page should have the expected title
      await expect(page).toHaveTitle(new RegExp(title, 'i'))
      
      // No JavaScript errors
      expect(errors).toHaveLength(0)
    })
  }
})

test.describe('Cross-Page Navigation', () => {
  test('full navigation flow: Home -> Explore -> Pricing -> About -> Home', async ({ page }) => {
    // Start at home
    await gotoPage(page, '/')
    await expect(page).toHaveURL('/')

    // Go to explore
    await page.getByRole('link', { name: /explore/i }).first().click()
    await expect(page).toHaveURL('/explore')

    // Go to pricing
    await page.getByRole('link', { name: /pricing/i }).first().click()
    await expect(page).toHaveURL('/pricing')

    // Go to about (from footer)
    const footer = page.locator('footer')
    await footer.scrollIntoViewIfNeeded()
    await footer.getByRole('link', { name: /about/i }).click()
    await expect(page).toHaveURL('/about')

    // Back to home via logo
    const homeLogo = page.locator('header a[href="/"]').first()
    await expect(homeLogo).toBeVisible({ timeout: 15000 })
    await Promise.all([
      page.waitForURL('**/', { timeout: 15000 }),
      homeLogo.click(),
    ])
    await expect(page).toHaveURL('/', { timeout: 15000 })
  })
})
