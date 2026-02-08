import { test, expect, type Page } from '@playwright/test'

const visualDiffPixelRatio = process.env.CI ? 0.2 : 0.05

async function gotoPage(page: Page, path: string) {
  await page.goto(path, { waitUntil: 'domcontentloaded', timeout: 60000 })
  await page.waitForLoadState('networkidle')
}

test.describe('Visual Regression Tests', () => {
  test.describe('Home Page', () => {
    test('full page screenshot - desktop', async ({ page }) => {
      await page.setViewportSize({ width: 1280, height: 720 })
      await gotoPage(page, '/')
      
      await expect(page).toHaveScreenshot('home-desktop.png', {
        maxDiffPixelRatio: visualDiffPixelRatio,
      })
    })

    test('full page screenshot - mobile', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 })
      await gotoPage(page, '/')
      
      await expect(page).toHaveScreenshot('home-mobile.png', {
        maxDiffPixelRatio: visualDiffPixelRatio,
      })
    })

    test('full page screenshot - tablet', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 })
      await gotoPage(page, '/')
      
      await expect(page).toHaveScreenshot('home-tablet.png', {
        maxDiffPixelRatio: visualDiffPixelRatio,
      })
    })

    test('hero section screenshot', async ({ page }) => {
      await page.setViewportSize({ width: 1280, height: 720 })
      await gotoPage(page, '/')
      
      const hero = page.locator('section').first()
      await expect(hero).toHaveScreenshot('hero-section.png', {
        maxDiffPixelRatio: visualDiffPixelRatio,
      })
    })

    test('features section screenshot', async ({ page }) => {
      await page.setViewportSize({ width: 1280, height: 720 })
      await gotoPage(page, '/')
      
      // Scroll to features section
      await page.getByText('Everything you need').scrollIntoViewIfNeeded()
      
      const features = page.locator('section').filter({ hasText: 'Everything you need' })
      await expect(features).toHaveScreenshot('features-section.png', {
        maxDiffPixelRatio: visualDiffPixelRatio,
      })
    })

    test('CTA section screenshot', async ({ page }) => {
      await page.setViewportSize({ width: 1280, height: 720 })
      await gotoPage(page, '/')
      
      // Scroll to CTA section
      await page.getByText('Ready to share your automations').scrollIntoViewIfNeeded()
      
      const cta = page.locator('section').filter({ hasText: 'Ready to share' })
      await expect(cta).toHaveScreenshot('cta-section.png', {
        maxDiffPixelRatio: visualDiffPixelRatio,
      })
    })

    test('header screenshot', async ({ page }) => {
      await page.setViewportSize({ width: 1280, height: 720 })
      await gotoPage(page, '/')
      
      const header = page.locator('header')
      await expect(header).toHaveScreenshot('header.png', {
        maxDiffPixelRatio: visualDiffPixelRatio,
      })
    })

    test('footer screenshot', async ({ page }) => {
      await page.setViewportSize({ width: 1280, height: 720 })
      await gotoPage(page, '/')
      
      const footer = page.locator('footer')
      await footer.scrollIntoViewIfNeeded()
      await expect(footer).toHaveScreenshot('footer.png', {
        maxDiffPixelRatio: visualDiffPixelRatio,
      })
    })
  })

  test.describe('Login Page', () => {
    test('full page screenshot - desktop', async ({ page }) => {
      await page.setViewportSize({ width: 1280, height: 720 })
      await gotoPage(page, '/login')
      
      await expect(page).toHaveScreenshot('login-desktop.png', {
        maxDiffPixelRatio: visualDiffPixelRatio,
      })
    })

    test('full page screenshot - mobile', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 })
      await gotoPage(page, '/login')
      
      await expect(page).toHaveScreenshot('login-mobile.png', {
        maxDiffPixelRatio: visualDiffPixelRatio,
      })
    })

    test('login form screenshot', async ({ page }) => {
      await page.setViewportSize({ width: 1280, height: 720 })
      await gotoPage(page, '/login')
      
      const form = page.locator('div').filter({ hasText: 'Welcome back' }).first()
      await expect(form).toHaveScreenshot('login-form.png', {
        maxDiffPixelRatio: visualDiffPixelRatio,
      })
    })

    test('github button screenshot', async ({ page }) => {
      await page.setViewportSize({ width: 1280, height: 720 })
      await gotoPage(page, '/login')
      
      const button = page.getByRole('button', { name: /continue with github/i })
      await expect(button).toHaveScreenshot('github-button.png', {
        maxDiffPixelRatio: visualDiffPixelRatio,
      })
    })
  })

  test.describe('404 Page', () => {
    test('404 page screenshot', async ({ page }) => {
      await page.setViewportSize({ width: 1280, height: 720 })
      await gotoPage(page, '/non-existent-page-12345')
      
      await expect(page).toHaveScreenshot('404-page.png', {
        maxDiffPixelRatio: visualDiffPixelRatio,
      })
    })
  })

  test.describe('Explore Page', () => {
    test('full page screenshot', async ({ page }) => {
      await page.setViewportSize({ width: 1280, height: 720 })
      await gotoPage(page, '/explore')
      
      await expect(page).toHaveScreenshot('explore-desktop.png', {
        maxDiffPixelRatio: visualDiffPixelRatio,
      })
    })
  })

  test.describe('Pricing Page', () => {
    test('full page screenshot', async ({ page }) => {
      await page.setViewportSize({ width: 1280, height: 720 })
      await gotoPage(page, '/pricing')
      
      await expect(page).toHaveScreenshot('pricing-desktop.png', {
        maxDiffPixelRatio: visualDiffPixelRatio,
      })
    })

    test('pricing cards screenshot', async ({ page }) => {
      await page.setViewportSize({ width: 1280, height: 720 })
      await gotoPage(page, '/pricing')
      
      const cards = page.locator('.grid').first()
      await expect(cards).toHaveScreenshot('pricing-cards.png', {
        maxDiffPixelRatio: visualDiffPixelRatio,
      })
    })
  })

  test.describe('About Page', () => {
    test('full page screenshot', async ({ page }) => {
      await page.setViewportSize({ width: 1280, height: 720 })
      await gotoPage(page, '/about')
      
      await expect(page).toHaveScreenshot('about-desktop.png', {
        maxDiffPixelRatio: visualDiffPixelRatio,
      })
    })
  })

  test.describe('Legal Pages', () => {
    test('privacy page screenshot', async ({ page }) => {
      await page.setViewportSize({ width: 1280, height: 720 })
      await gotoPage(page, '/privacy')
      
      await expect(page).toHaveScreenshot('privacy-desktop.png', {
        maxDiffPixelRatio: visualDiffPixelRatio,
      })
    })

    test('terms page screenshot', async ({ page }) => {
      await page.setViewportSize({ width: 1280, height: 720 })
      await gotoPage(page, '/terms')
      
      await expect(page).toHaveScreenshot('terms-desktop.png', {
        maxDiffPixelRatio: visualDiffPixelRatio,
      })
    })
  })

  test.describe('Component States', () => {
    test('button hover state', async ({ page }) => {
      await page.setViewportSize({ width: 1280, height: 720 })
      await gotoPage(page, '/')
      
      const button = page.getByRole('button', { name: /start publishing/i }).first()
      const beforeBackground = await button.evaluate((element) => getComputedStyle(element).backgroundColor)
      await button.hover()
      const afterBackground = await button.evaluate((element) => getComputedStyle(element).backgroundColor)

      expect(afterBackground).not.toBe(beforeBackground)
    })

    test('button focus state', async ({ page }) => {
      await page.setViewportSize({ width: 1280, height: 720 })
      await gotoPage(page, '/')
      
      const button = page.getByRole('button', { name: /start publishing/i }).first()
      await button.focus()
      await expect(button).toBeFocused()
    })

    test('feature card hover state', async ({ page }) => {
      await page.setViewportSize({ width: 1280, height: 720 })
      await gotoPage(page, '/')
      
      const featureCard = page
        .locator('div.rounded-2xl.border.border-gray-200')
        .filter({ hasText: 'Rich Publishing' })
        .first()
      await featureCard.scrollIntoViewIfNeeded()
      const beforeShadow = await featureCard.evaluate((element) => getComputedStyle(element).boxShadow)
      await featureCard.hover()
      const afterShadow = await featureCard.evaluate((element) => getComputedStyle(element).boxShadow)

      expect(afterShadow).not.toBe(beforeShadow)
    })
  })

  test.describe('Dark/Light Theme', () => {
    test('home page in light mode', async ({ page }) => {
      await page.emulateMedia({ colorScheme: 'light' })
      await page.setViewportSize({ width: 1280, height: 720 })
      await gotoPage(page, '/')
      
      await expect(page).toHaveScreenshot('home-light-mode.png', {
        maxDiffPixelRatio: visualDiffPixelRatio,
      })
    })

    test('login page in light mode', async ({ page }) => {
      await page.emulateMedia({ colorScheme: 'light' })
      await page.setViewportSize({ width: 1280, height: 720 })
      await gotoPage(page, '/login')
      
      await expect(page).toHaveScreenshot('login-light-mode.png', {
        maxDiffPixelRatio: visualDiffPixelRatio,
      })
    })
  })
})
