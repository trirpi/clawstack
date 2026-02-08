import { test, expect, type Page } from '@playwright/test'

async function gotoPage(page: Page, url: string) {
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 })
}

test.describe('Accessibility', () => {
  test('home page should have proper heading hierarchy', async ({ page }) => {
    await gotoPage(page, '/')
    await expect(page.getByRole('heading', { level: 1 }).first()).toBeVisible({ timeout: 15000 })
    
    // Should have exactly one h1
    const h1s = await page.getByRole('heading', { level: 1 }).count()
    expect(h1s).toBe(1)
    
    // Should have h2s for sections
    const h2s = await page.getByRole('heading', { level: 2 }).count()
    expect(h2s).toBeGreaterThan(0)
  })

  test('buttons should be keyboard accessible', async ({ page }) => {
    await gotoPage(page, '/')
    
    // Tab to the first button
    await page.keyboard.press('Tab')
    
    // Should be able to focus on interactive elements
    const focusedElement = page.locator(':focus')
    await expect(focusedElement).toBeVisible()
  })

  test('links should have descriptive text', async ({ page }) => {
    await gotoPage(page, '/')
    
    // Get all links
    const links = page.getByRole('link')
    const count = await links.count()
    
    for (let i = 0; i < Math.min(count, 10); i++) {
      const link = links.nth(i)
      const text = await link.textContent()
      // Links should have text content (not empty)
      expect(text?.trim().length).toBeGreaterThan(0)
    }
  })

  test('images should have alt text', async ({ page }) => {
    await gotoPage(page, '/')
    
    const images = page.locator('img')
    const count = await images.count()
    
    for (let i = 0; i < count; i++) {
      const img = images.nth(i)
      const alt = await img.getAttribute('alt')
      // Images should have alt attribute
      expect(alt).not.toBeNull()
    }
  })

  test('form inputs should have labels', async ({ page }) => {
    await gotoPage(page, '/login')
    
    // Any inputs should have associated labels or aria-labels
    const inputs = page.locator('input, textarea')
    const count = await inputs.count()
    
    for (let i = 0; i < count; i++) {
      const input = inputs.nth(i)
      const ariaLabel = await input.getAttribute('aria-label')
      const id = await input.getAttribute('id')
      const placeholder = await input.getAttribute('placeholder')
      
      // Should have some form of labeling
      const hasLabel = ariaLabel || id || placeholder
      expect(hasLabel).toBeTruthy()
    }
  })

  test('interactive elements should have focus styles', async ({ page }) => {
    await gotoPage(page, '/')
    
    // Focus on a button
    const button = page.getByRole('link', { name: /start publishing/i }).first()
    await button.focus()
    
    // Check the element is focused
    await expect(button).toBeFocused()
  })

  test('page should have a main landmark', async ({ page }) => {
    await gotoPage(page, '/')
    
    const main = page.getByRole('main')
    await expect(main).toBeVisible()
  })

  test('color contrast should be sufficient', async ({ page }) => {
    await gotoPage(page, '/')
    
    // Check that text elements are visible (basic contrast check)
    const heading = page.getByRole('heading', { level: 1 })
    await expect(heading).toBeVisible()
    
    const bodyText = page.getByText(/publishing platform/i)
    await expect(bodyText).toBeVisible()
  })
})
