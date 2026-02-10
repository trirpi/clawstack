import { test, expect } from '@playwright/test'
import { gotoPage } from './utils/navigation'

/**
 * Comprehensive component tests - verify all interactive elements work correctly
 */

test.describe('Button Components', () => {
  test('all buttons on home page should be clickable', async ({ page }) => {
    await gotoPage(page, '/')
    await expect(page.getByRole('link', { name: /start publishing/i })).toBeVisible({ timeout: 15000 })
    
    // Find all buttons and links styled as buttons
    const buttons = page.locator('button, a.inline-flex, a[class*="rounded"]')
    const count = await buttons.count()
    
    expect(count).toBeGreaterThan(0)
    
    // Verify each is visible and enabled
    for (let i = 0; i < count; i++) {
      const button = buttons.nth(i)
      if (await button.isVisible()) {
        await expect(button).toBeEnabled()
      }
    }
  })

  test('primary button should be visible and functional', async ({ page }) => {
    await gotoPage(page, '/')
    
    const primaryButton = page.getByRole('link', { name: /start publishing/i })
    await expect(primaryButton).toBeVisible()
    
    // Verify the link works
    await primaryButton.click()
    await expect(page).toHaveURL('/login')
  })

  test('outline button should be visible and functional', async ({ page }) => {
    await gotoPage(page, '/')
    
    const outlineButton = page.getByRole('link', { name: /explore content/i })
    await expect(outlineButton).toBeVisible()
    
    // Verify the link works
    await outlineButton.click()
    await expect(page).toHaveURL('/explore')
  })

  test('CTA button should be visible', async ({ page }) => {
    await gotoPage(page, '/')
    
    // Scroll to CTA
    await page.getByText('Ready to share your automations').scrollIntoViewIfNeeded()
    
    const ctaButton = page.getByRole('link', { name: /create your publication/i })
    await expect(ctaButton).toBeVisible()
  })
})

test.describe('Header Component', () => {
  test('logo should link to home', async ({ page }) => {
    await gotoPage(page, '/explore')
    
    await page.getByRole('link').filter({ has: page.getByText('Clawstack') }).first().click()
    await expect(page).toHaveURL('/')
  })

  test('header should be sticky at top of page', async ({ page }) => {
    await gotoPage(page, '/')
    
    const header = page.locator('header')
    await expect(header).toBeVisible()
    
    // Header should be near the top
    const box = await header.boundingBox()
    expect(box?.y).toBeLessThan(10)
    
    // Header should be sticky
    await expect(header).toHaveCSS('position', 'sticky')
  })

  test('navigation links should be visible on desktop', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 })
    await gotoPage(page, '/')
    
    // Desktop nav should be visible
    await expect(page.getByRole('link', { name: /explore/i }).first()).toBeVisible()
    await expect(page.getByRole('link', { name: /pricing/i }).first()).toBeVisible()
  })

  test('header should have sign in and get started buttons', async ({ page }) => {
    await gotoPage(page, '/')

    const authLinks = page.locator('header a[href="/login"]')
    const dashboardLink = page.locator('header a[href="/dashboard"]')
    await expect
      .poll(async () => (await authLinks.count()) + (await dashboardLink.count()), { timeout: 60000 })
      .toBeGreaterThan(0)
  })
})

test.describe('Footer Component', () => {
  test('footer should contain all required links', async ({ page }) => {
    await gotoPage(page, '/')
    
    const footer = page.locator('footer')
    await footer.scrollIntoViewIfNeeded()
    
    await expect(footer.getByRole('link', { name: /about/i })).toBeVisible()
    await expect(footer.getByRole('link', { name: /pricing/i })).toBeVisible()
    await expect(footer.getByRole('link', { name: /privacy/i })).toBeVisible()
    await expect(footer.getByRole('link', { name: /terms/i })).toBeVisible()
  })

  test('footer should display copyright', async ({ page }) => {
    await gotoPage(page, '/')
    
    const footer = page.locator('footer')
    await footer.scrollIntoViewIfNeeded()
    
    await expect(footer).toContainText('Clawstack')
    await expect(footer).toContainText(new Date().getFullYear().toString())
  })
})

test.describe('Hero Section', () => {
  test('hero should have main heading with Clawstack', async ({ page }) => {
    await gotoPage(page, '/')
    
    const heading = page.getByRole('heading', { level: 1 })
    await expect(heading).toContainText('Clawstack')
  })

  test('hero should have description', async ({ page }) => {
    await gotoPage(page, '/')
    
    await expect(page.getByText(/publishing platform/i)).toBeVisible()
  })

  test('hero should have two CTA buttons', async ({ page }) => {
    await gotoPage(page, '/')
    
    await expect(page.getByRole('link', { name: /start publishing/i })).toBeVisible()
    await expect(page.getByRole('link', { name: /explore content/i })).toBeVisible()
  })

  test('hero should have stats section', async ({ page }) => {
    await gotoPage(page, '/')
    
    await expect(page.getByText('Post formats available now')).toBeVisible()
    await expect(page.getByText('Reader access modes')).toBeVisible()
  })
})

test.describe('Features Section', () => {
  test('features should display feature cards', async ({ page }) => {
    await gotoPage(page, '/')
    
    // Look for feature cards by their headings
    const featureHeadings = page.locator('h3')
    const count = await featureHeadings.count()
    expect(count).toBeGreaterThan(0)
  })
})

test.describe('Pricing Page Components', () => {
  test('pricing page should display Free and Pro plans', async ({ page }) => {
    await gotoPage(page, '/pricing')
    
    // Look for plan names
    await expect(page.getByRole('heading', { name: 'Free', exact: true })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Pro', exact: true })).toBeVisible()
  })

  test('pricing page should have FAQ section', async ({ page }) => {
    await gotoPage(page, '/pricing')
    
    await expect(page.getByText('Frequently Asked Questions')).toBeVisible()
  })

  test('pricing page should have CTA buttons', async ({ page }) => {
    await gotoPage(page, '/pricing')
    
    // Should have Get Started and Start Earning buttons
    const main = page.getByRole('main')
    await expect(main.getByRole('button', { name: 'Get Started' })).toBeVisible()
    await expect(main.getByRole('button', { name: 'Start Earning' })).toBeVisible()
  })

  test('pricing page should display prices', async ({ page }) => {
    await gotoPage(page, '/pricing')
    
    // Look for price text - use first() since they may appear multiple places
    await expect(page.getByText('$0').first()).toBeVisible()
    await expect(page.getByText('10%').first()).toBeVisible()
  })
})

test.describe('Explore Page Components', () => {
  test('explore page should have title', async ({ page }) => {
    await gotoPage(page, '/explore')
    
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Explore')
  })

  test('explore page should have description', async ({ page }) => {
    await gotoPage(page, '/explore')
    
    await expect(
      page.getByText('Discover scripts, plugins, prompts, and tutorials from the community')
    ).toBeVisible()
  })
})

test.describe('About Page Components', () => {
  test('about page should have title', async ({ page }) => {
    await gotoPage(page, '/about')
    
    await expect(page.getByRole('heading', { level: 1 })).toContainText('About')
  })

  test('about page should have mission section', async ({ page }) => {
    await gotoPage(page, '/about')
    
    await expect(page.getByText(/mission/i)).toBeVisible()
  })
})

test.describe('Legal Pages', () => {
  test('privacy page should have required sections', async ({ page }) => {
    await gotoPage(page, '/privacy')
    
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Privacy')
    // Look for the heading specifically
    await expect(page.getByRole('heading', { name: /information we collect/i })).toBeVisible()
  })

  test('terms page should have required sections', async ({ page }) => {
    await gotoPage(page, '/terms')
    
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Terms')
    await expect(page.getByText(/acceptance of terms/i)).toBeVisible()
  })
})

test.describe('Login Page', () => {
  test('login page should have GitHub OAuth button', async ({ page }) => {
    await gotoPage(page, '/login')
    
    const githubButton = page.getByRole('button', { name: /github/i })
    await expect(githubButton).toBeVisible()
    await expect(githubButton).toBeEnabled()
  })

  test('login page should have branding', async ({ page }) => {
    await gotoPage(page, '/login')
    
    await expect(page.getByText('Clawstack')).toBeVisible()
  })

  test('login page should have legal links', async ({ page }) => {
    await gotoPage(page, '/login')
    
    await expect(page.getByRole('link', { name: /terms/i })).toBeVisible()
    await expect(page.getByRole('link', { name: /privacy/i })).toBeVisible()
  })
})
