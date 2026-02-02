import { describe, it, expect } from 'vitest'

describe('Stripe utilities', () => {
  it('should export utility functions', async () => {
    const stripeModule = await import('@/lib/stripe')
    
    // Verify they are functions (stripe client may be null without API key)
    expect(typeof stripeModule.createCheckoutSession).toBe('function')
    expect(typeof stripeModule.createBillingPortalSession).toBe('function')
    expect(typeof stripeModule.createConnectAccount).toBe('function')
    expect(typeof stripeModule.createAccountLink).toBe('function')
  })

  it('should have stripe client (null without API key)', async () => {
    const { stripe } = await import('@/lib/stripe')
    // In test environment without STRIPE_SECRET_KEY, stripe is null
    // In production, it would be a Stripe instance
    expect(stripe === null || typeof stripe === 'object').toBe(true)
  })
})
