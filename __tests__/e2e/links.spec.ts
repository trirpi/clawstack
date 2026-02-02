import { test, expect } from '@playwright/test'

/**
 * These tests validate that ALL internal links in the app lead to working pages.
 * If a link is broken (404), the test will fail.
 */

test.describe('Link Validation', () => {
  test.describe('Navigation Links', () => {
    test('header explore link should work', async ({ page }) => {
      await page.goto('/')
      await page.getByRole('link', { name: /explore/i }).first().click()
      await expect(page).toHaveURL('/explore')
      await expect(page.getByRole('heading', { level: 1 })).toContainText('Explore')
    })

    test('header pricing link should work', async ({ page }) => {
      await page.goto('/')
      await page.getByRole('link', { name: /pricing/i }).first().click()
      await expect(page).toHaveURL('/pricing')
      await expect(page.getByRole('heading', { level: 1 })).toContainText('pricing')
    })

    test('header sign in link should work', async ({ page }) => {
      await page.goto('/')
      await page.getByRole('link', { name: /sign in/i }).click()
      await expect(page).toHaveURL('/login')
    })

    test('header get started link should work', async ({ page }) => {
      await page.goto('/')
      await page.getByRole('link', { name: /get started/i }).first().click()
      await expect(page).toHaveURL('/login')
    })
  })

  test.describe('Footer Links', () => {
    test('about link should work', async ({ page }) => {
      await page.goto('/')
      const footer = page.locator('footer')
      await footer.scrollIntoViewIfNeeded()
      await footer.getByRole('link', { name: /about/i }).click()
      await expect(page).toHaveURL('/about')
      await expect(page.getByRole('heading', { level: 1 })).toContainText('About')
    })

    test('pricing link in footer should work', async ({ page }) => {
      await page.goto('/')
      const footer = page.locator('footer')
      await footer.scrollIntoViewIfNeeded()
      await footer.getByRole('link', { name: /pricing/i }).click()
      await expect(page).toHaveURL('/pricing')
    })

    test('privacy link should work', async ({ page }) => {
      await page.goto('/')
      const footer = page.locator('footer')
      await footer.scrollIntoViewIfNeeded()
      await footer.getByRole('link', { name: /privacy/i }).click()
      await expect(page).toHaveURL('/privacy')
      await expect(page.getByRole('heading', { level: 1 })).toContainText('Privacy')
    })

    test('terms link should work', async ({ page }) => {
      await page.goto('/')
      const footer = page.locator('footer')
      await footer.scrollIntoViewIfNeeded()
      await footer.getByRole('link', { name: /terms/i }).click()
      await expect(page).toHaveURL('/terms')
      await expect(page.getByRole('heading', { level: 1 })).toContainText('Terms')
    })
  })

  test.describe('Hero Section Links', () => {
    test('start publishing button should work', async ({ page }) => {
      await page.goto('/')
      await page.getByRole('link', { name: /start publishing/i }).click()
      await expect(page).toHaveURL('/login')
    })

    test('explore content button should work', async ({ page }) => {
      await page.goto('/')
      await page.getByRole('link', { name: /explore content/i }).click()
      await expect(page).toHaveURL('/explore')
    })
  })

  test.describe('CTA Section Links', () => {
    test('create your publication button should work', async ({ page }) => {
      await page.goto('/')
      // Scroll to CTA section
      await page.getByText('Ready to share your automations').scrollIntoViewIfNeeded()
      await page.getByRole('link', { name: /create your publication/i }).click()
      await expect(page).toHaveURL('/login')
    })
  })

  test.describe('Login Page Links', () => {
    test('terms link on login should work', async ({ page }) => {
      await page.goto('/login')
      await page.getByRole('link', { name: /terms of service/i }).click()
      await expect(page).toHaveURL('/terms')
    })

    test('privacy link on login should work', async ({ page }) => {
      await page.goto('/login')
      await page.getByRole('link', { name: /privacy policy/i }).click()
      await expect(page).toHaveURL('/privacy')
    })

    test('logo link on login should go home', async ({ page }) => {
      await page.goto('/login')
      await page.getByRole('link').filter({ has: page.getByText('Clawstack') }).first().click()
      await expect(page).toHaveURL('/')
    })
  })

  test.describe('Pricing Page Links', () => {
    test('get started button should work', async ({ page }) => {
      await page.goto('/pricing')
      await page.getByRole('link', { name: /get started/i }).click()
      await expect(page).toHaveURL('/login')
    })

    test('start earning button should work', async ({ page }) => {
      await page.goto('/pricing')
      await page.getByRole('link', { name: /start earning/i }).click()
      await expect(page).toHaveURL('/login')
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
      
      const response = await page.goto(path)
      
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
    await page.goto('/')
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
    await page.getByRole('link').filter({ has: page.getByText('Clawstack') }).first().click()
    await expect(page).toHaveURL('/')
  })
})
