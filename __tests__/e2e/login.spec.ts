import { test, expect, type Page } from '@playwright/test'

async function gotoPage(page: Page, url: string) {
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 })
}

test.describe('Login Page', () => {
  test('should display login page', async ({ page }) => {
    await gotoPage(page, '/login')
    
    await expect(page.getByRole('heading', { name: /welcome back/i })).toBeVisible()
  })

  test('should show Clawstack branding', async ({ page }) => {
    await gotoPage(page, '/login')
    
    await expect(page.getByText('🦞')).toBeVisible()
    await expect(page.getByText('Clawstack')).toBeVisible()
  })

  test('should have GitHub sign in button', async ({ page }) => {
    await gotoPage(page, '/login')
    
    const githubButton = page.getByRole('button', { name: /continue with github/i })
    await expect(githubButton).toBeVisible()
  })

  test('should have terms and privacy links', async ({ page }) => {
    await gotoPage(page, '/login')
    
    await expect(page.getByRole('link', { name: /terms of service/i })).toBeVisible()
    await expect(page.getByRole('link', { name: /privacy policy/i })).toBeVisible()
  })

  test('should have back to home link via logo', async ({ page }) => {
    await gotoPage(page, '/login')
    
    const logoLink = page.locator('a[href="/"]').filter({ hasText: /clawstack/i }).first()
    await expect(logoLink).toBeVisible()
    await expect(logoLink).toHaveAttribute('href', '/')
  })
})
