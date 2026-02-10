import Stripe from 'stripe'

// Only initialize Stripe if we have a secret key
const stripeKey = process.env.STRIPE_SECRET_KEY
export const stripe: Stripe | null = stripeKey
  ? new Stripe(stripeKey, { apiVersion: '2026-01-28.clover' })
  : null

function assertStripeConfigured(candidate: Stripe | null): asserts candidate is Stripe {
  if (!candidate) {
    throw new Error('Stripe is not configured. Please set STRIPE_SECRET_KEY.')
  }
}

/**
 * Create a Stripe Checkout session for subscription
 */
export async function createCheckoutSession({
  priceId,
  customerId,
  userId,
  publicationId,
  successUrl,
  cancelUrl,
}: {
  priceId: string
  customerId?: string
  userId: string
  publicationId: string
  successUrl: string
  cancelUrl: string
}) {
  const stripeClient = stripe
  assertStripeConfigured(stripeClient)
  const session = await stripeClient.checkout.sessions.create({
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    customer: customerId || undefined,
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: {
      userId,
      publicationId,
    },
  })

  return session
}

/**
 * Create a Stripe billing portal session
 */
export async function createBillingPortalSession({
  customerId,
  returnUrl,
}: {
  customerId: string
  returnUrl: string
}) {
  const stripeClient = stripe
  assertStripeConfigured(stripeClient)
  const session = await stripeClient.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  })

  return session
}

/**
 * Create a Stripe Connect account for creators
 */
export async function createConnectAccount({
  email,
  userId,
}: {
  email: string
  userId: string
}) {
  const stripeClient = stripe
  assertStripeConfigured(stripeClient)
  const account = await stripeClient.accounts.create({
    type: 'express',
    email,
    metadata: {
      userId,
    },
    capabilities: {
      card_payments: { requested: true },
      transfers: { requested: true },
    },
  })

  return account
}

/**
 * Create an account link for Stripe Connect onboarding
 */
export async function createAccountLink({
  accountId,
  refreshUrl,
  returnUrl,
}: {
  accountId: string
  refreshUrl: string
  returnUrl: string
}) {
  const stripeClient = stripe
  assertStripeConfigured(stripeClient)
  const accountLink = await stripeClient.accountLinks.create({
    account: accountId,
    refresh_url: refreshUrl,
    return_url: returnUrl,
    type: 'account_onboarding',
  })

  return accountLink
}
