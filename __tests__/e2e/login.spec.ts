import { test, expect } from '@playwright/test'

test.describe('Login Page', () => {
  test('should display login page', async ({ page }) => {
    await page.goto('/login')
    
    await expect(page.getByRole('heading', { name: /welcome back/i })).toBeVisible()
  })

  test('should show OpenClaw branding', async ({ page }) => {
    await page.goto('/login')
    
    await expect(page.getByText('🦞')).toBeVisible()
    await expect(page.getByText('OpenClaw')).toBeVisible()
  })

  test('should have GitHub sign in button', async ({ page }) => {
    await page.goto('/login')
    
    const githubButton = page.getByRole('button', { name: /continue with github/i })
    await expect(githubButton).toBeVisible()
  })

  test('should have terms and privacy links', async ({ page }) => {
    await page.goto('/login')
    
    await expect(page.getByRole('link', { name: /terms of service/i })).toBeVisible()
    await expect(page.getByRole('link', { name: /privacy policy/i })).toBeVisible()
  })

  test('should have back to home link via logo', async ({ page }) => {
    await page.goto('/login')
    
    const logoLink = page.getByRole('link').filter({ has: page.getByText('🦞') })
    await expect(logoLink).toBeVisible()
    
    await logoLink.click()
    await expect(page).toHaveURL('/')
  })
})
