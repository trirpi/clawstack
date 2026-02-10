import type { APIResponse, Page } from '@playwright/test'

const NAVIGATION_TIMEOUT_MS = 60000
const RETRY_ATTEMPTS = 3

export async function gotoPage(page: Page, url: string) {
  let lastError: unknown

  for (let attempt = 0; attempt < RETRY_ATTEMPTS; attempt += 1) {
    try {
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: NAVIGATION_TIMEOUT_MS })
      return
    } catch (error) {
      lastError = error
      const message = error instanceof Error ? error.message : String(error)
      if (!message.includes('ERR_NETWORK_IO_SUSPENDED') || attempt === RETRY_ATTEMPTS - 1) {
        throw error
      }
      await page.waitForTimeout(500 * (attempt + 1))
    }
  }

  throw lastError
}

export async function gotoPageWithResponse(page: Page, url: string): Promise<APIResponse | null> {
  let lastError: unknown

  for (let attempt = 0; attempt < RETRY_ATTEMPTS; attempt += 1) {
    try {
      return await page.goto(url, { waitUntil: 'domcontentloaded', timeout: NAVIGATION_TIMEOUT_MS })
    } catch (error) {
      lastError = error
      const message = error instanceof Error ? error.message : String(error)
      if (!message.includes('ERR_NETWORK_IO_SUSPENDED') || attempt === RETRY_ATTEMPTS - 1) {
        throw error
      }
      await page.waitForTimeout(500 * (attempt + 1))
    }
  }

  throw lastError
}
