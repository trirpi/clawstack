import { test, expect } from '@playwright/test'

/**
 * Dashboard flow tests - verify all dashboard pages load and links work
 * Note: These tests verify page structure without authentication
 */

test.describe('Dashboard Pages Structure', () => {
  // Dashboard redirects to login when not authenticated
  test('dashboard should redirect to login when not authenticated', async ({ page }) => {
    await page.goto('/dashboard')
    // Should redirect to login
    await expect(page).toHaveURL(/\/login/)
  })

  test('dashboard/settings should redirect to login', async ({ page }) => {
    await page.goto('/dashboard/settings')
    await expect(page).toHaveURL(/\/login/)
  })

  test('dashboard/earnings should redirect to login', async ({ page }) => {
    await page.goto('/dashboard/earnings')
    await expect(page).toHaveURL(/\/login/)
  })

  test('dashboard/subscribers should redirect to login', async ({ page }) => {
    await page.goto('/dashboard/subscribers')
    await expect(page).toHaveURL(/\/login/)
  })

  test('dashboard/newsletter should redirect to login', async ({ page }) => {
    await page.goto('/dashboard/newsletter')
    await expect(page).toHaveURL(/\/login/)
  })

  test('dashboard/new should redirect to login', async ({ page }) => {
    await page.goto('/dashboard/new')
    await expect(page).toHaveURL(/\/login/)
  })
})

test.describe('Public Pages Load Correctly', () => {
  test('pricing page loads with plans', async ({ page }) => {
    await page.goto('/pricing')
    await expect(page.getByRole('heading', { name: 'Free', exact: true })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Pro', exact: true })).toBeVisible()
    // Use main to avoid nav button
    await expect(page.getByRole('main').getByRole('button', { name: 'Get Started' })).toBeVisible()
    await expect(page.getByRole('main').getByRole('button', { name: 'Start Earning' })).toBeVisible()
  })

  test('about page loads with content', async ({ page }) => {
    await page.goto('/about')
    await expect(page.getByRole('heading', { level: 1 })).toContainText('About')
    await expect(page.getByText(/mission/i)).toBeVisible()
  })

  test('explore page loads', async ({ page }) => {
    await page.goto('/explore')
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Explore')
  })
})

test.describe('Navigation Elements', () => {
  test('header has all navigation links', async ({ page }) => {
    await page.goto('/')
    
    await expect(page.getByRole('link', { name: /explore/i }).first()).toBeVisible()
    await expect(page.getByRole('link', { name: /pricing/i }).first()).toBeVisible()
    await expect(page.getByRole('link', { name: /sign in/i })).toBeVisible()
    await expect(page.getByRole('link', { name: /get started/i }).first()).toBeVisible()
  })

  test('footer has all links', async ({ page }) => {
    await page.goto('/')
    const footer = page.locator('footer')
    await footer.scrollIntoViewIfNeeded()
    
    await expect(footer.getByRole('link', { name: /about/i })).toBeVisible()
    await expect(footer.getByRole('link', { name: /pricing/i })).toBeVisible()
    await expect(footer.getByRole('link', { name: /privacy/i })).toBeVisible()
    await expect(footer.getByRole('link', { name: /terms/i })).toBeVisible()
  })
})

test.describe('API Routes Respond', () => {
  test('settings API requires authentication', async ({ request }) => {
    const response = await request.put('/api/settings', {
      data: { publication: { name: 'Test' } },
    })
    expect(response.status()).toBe(401)
  })

  test('newsletter API requires authentication', async ({ request }) => {
    const response = await request.post('/api/newsletter/send', {
      data: { subject: 'Test', content: 'Test' },
    })
    expect(response.status()).toBe(401)
  })

  test('stripe connect API requires authentication', async ({ request }) => {
    const response = await request.post('/api/stripe/connect')
    expect(response.status()).toBe(401)
  })

  test('stripe dashboard API requires authentication', async ({ request }) => {
    const response = await request.post('/api/stripe/dashboard')
    expect(response.status()).toBe(401)
  })
})

test.describe('Form Validations', () => {
  test('login page has GitHub button', async ({ page }) => {
    await page.goto('/login')
    await expect(page.getByRole('button', { name: /github/i })).toBeVisible()
  })

  test('pricing buttons link to login', async ({ page }) => {
    await page.goto('/pricing')
    
    const getStartedButton = page.getByRole('link', { name: /get started/i })
    await getStartedButton.click()
    await expect(page).toHaveURL('/login')
  })
})
