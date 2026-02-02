import { test, expect } from '@playwright/test'

test.describe('Visual Regression Tests', () => {
  test.describe('Home Page', () => {
    test('full page screenshot - desktop', async ({ page }) => {
      await page.setViewportSize({ width: 1280, height: 720 })
      await page.goto('/')
      await page.waitForLoadState('networkidle')
      
      await expect(page).toHaveScreenshot('home-desktop.png', {
        fullPage: true,
        maxDiffPixelRatio: 0.05,
      })
    })

    test('full page screenshot - mobile', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 })
      await page.goto('/')
      await page.waitForLoadState('networkidle')
      
      await expect(page).toHaveScreenshot('home-mobile.png', {
        fullPage: true,
        maxDiffPixelRatio: 0.05,
      })
    })

    test('full page screenshot - tablet', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 })
      await page.goto('/')
      await page.waitForLoadState('networkidle')
      
      await expect(page).toHaveScreenshot('home-tablet.png', {
        fullPage: true,
        maxDiffPixelRatio: 0.05,
      })
    })

    test('hero section screenshot', async ({ page }) => {
      await page.setViewportSize({ width: 1280, height: 720 })
      await page.goto('/')
      await page.waitForLoadState('networkidle')
      
      const hero = page.locator('section').first()
      await expect(hero).toHaveScreenshot('hero-section.png', {
        maxDiffPixelRatio: 0.05,
      })
    })

    test('features section screenshot', async ({ page }) => {
      await page.setViewportSize({ width: 1280, height: 720 })
      await page.goto('/')
      await page.waitForLoadState('networkidle')
      
      // Scroll to features section
      await page.getByText('Everything you need').scrollIntoViewIfNeeded()
      
      const features = page.locator('section').filter({ hasText: 'Everything you need' })
      await expect(features).toHaveScreenshot('features-section.png', {
        maxDiffPixelRatio: 0.05,
      })
    })

    test('CTA section screenshot', async ({ page }) => {
      await page.setViewportSize({ width: 1280, height: 720 })
      await page.goto('/')
      await page.waitForLoadState('networkidle')
      
      // Scroll to CTA section
      await page.getByText('Ready to share your automations').scrollIntoViewIfNeeded()
      
      const cta = page.locator('section').filter({ hasText: 'Ready to share' })
      await expect(cta).toHaveScreenshot('cta-section.png', {
        maxDiffPixelRatio: 0.05,
      })
    })

    test('header screenshot', async ({ page }) => {
      await page.setViewportSize({ width: 1280, height: 720 })
      await page.goto('/')
      await page.waitForLoadState('networkidle')
      
      const header = page.locator('header')
      await expect(header).toHaveScreenshot('header.png', {
        maxDiffPixelRatio: 0.05,
      })
    })

    test('footer screenshot', async ({ page }) => {
      await page.setViewportSize({ width: 1280, height: 720 })
      await page.goto('/')
      await page.waitForLoadState('networkidle')
      
      const footer = page.locator('footer')
      await footer.scrollIntoViewIfNeeded()
      await expect(footer).toHaveScreenshot('footer.png', {
        maxDiffPixelRatio: 0.05,
      })
    })
  })

  test.describe('Login Page', () => {
    test('full page screenshot - desktop', async ({ page }) => {
      await page.setViewportSize({ width: 1280, height: 720 })
      await page.goto('/login')
      await page.waitForLoadState('networkidle')
      
      await expect(page).toHaveScreenshot('login-desktop.png', {
        fullPage: true,
        maxDiffPixelRatio: 0.05,
      })
    })

    test('full page screenshot - mobile', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 })
      await page.goto('/login')
      await page.waitForLoadState('networkidle')
      
      await expect(page).toHaveScreenshot('login-mobile.png', {
        fullPage: true,
        maxDiffPixelRatio: 0.05,
      })
    })

    test('login form screenshot', async ({ page }) => {
      await page.setViewportSize({ width: 1280, height: 720 })
      await page.goto('/login')
      await page.waitForLoadState('networkidle')
      
      const form = page.locator('div').filter({ hasText: 'Welcome back' }).first()
      await expect(form).toHaveScreenshot('login-form.png', {
        maxDiffPixelRatio: 0.05,
      })
    })

    test('github button screenshot', async ({ page }) => {
      await page.setViewportSize({ width: 1280, height: 720 })
      await page.goto('/login')
      await page.waitForLoadState('networkidle')
      
      const button = page.getByRole('button', { name: /continue with github/i })
      await expect(button).toHaveScreenshot('github-button.png', {
        maxDiffPixelRatio: 0.05,
      })
    })
  })

  test.describe('404 Page', () => {
    test('404 page screenshot', async ({ page }) => {
      await page.setViewportSize({ width: 1280, height: 720 })
      await page.goto('/non-existent-page-12345', { waitUntil: 'networkidle' })
      
      await expect(page).toHaveScreenshot('404-page.png', {
        fullPage: true,
        maxDiffPixelRatio: 0.05,
      })
    })
  })

  test.describe('Component States', () => {
    test('button hover state', async ({ page }) => {
      await page.setViewportSize({ width: 1280, height: 720 })
      await page.goto('/')
      await page.waitForLoadState('networkidle')
      
      const button = page.getByRole('link', { name: /start publishing/i }).first()
      await button.hover()
      
      await expect(button).toHaveScreenshot('button-hover.png', {
        maxDiffPixelRatio: 0.05,
      })
    })

    test('button focus state', async ({ page }) => {
      await page.setViewportSize({ width: 1280, height: 720 })
      await page.goto('/')
      await page.waitForLoadState('networkidle')
      
      const button = page.getByRole('link', { name: /start publishing/i }).first()
      await button.focus()
      
      await expect(button).toHaveScreenshot('button-focus.png', {
        maxDiffPixelRatio: 0.05,
      })
    })

    test('feature card hover state', async ({ page }) => {
      await page.setViewportSize({ width: 1280, height: 720 })
      await page.goto('/')
      await page.waitForLoadState('networkidle')
      
      const featureCard = page.locator('div').filter({ hasText: 'Rich Publishing' }).first()
      await featureCard.scrollIntoViewIfNeeded()
      await featureCard.hover()
      
      await expect(featureCard).toHaveScreenshot('feature-card-hover.png', {
        maxDiffPixelRatio: 0.05,
      })
    })
  })

  test.describe('Dark/Light Theme', () => {
    test('home page in light mode', async ({ page }) => {
      await page.emulateMedia({ colorScheme: 'light' })
      await page.setViewportSize({ width: 1280, height: 720 })
      await page.goto('/')
      await page.waitForLoadState('networkidle')
      
      await expect(page).toHaveScreenshot('home-light-mode.png', {
        fullPage: true,
        maxDiffPixelRatio: 0.05,
      })
    })

    test('login page in light mode', async ({ page }) => {
      await page.emulateMedia({ colorScheme: 'light' })
      await page.setViewportSize({ width: 1280, height: 720 })
      await page.goto('/login')
      await page.waitForLoadState('networkidle')
      
      await expect(page).toHaveScreenshot('login-light-mode.png', {
        fullPage: true,
        maxDiffPixelRatio: 0.05,
      })
    })
  })
})
