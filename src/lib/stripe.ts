import Stripe from 'stripe'

// Only initialize Stripe if we have a secret key
const stripeKey = process.env.STRIPE_SECRET_KEY
export const stripe = stripeKey
  ? new Stripe(stripeKey, { apiVersion: '2026-01-28.clover' })
  : (null as unknown as Stripe)

/**
 * Create a Stripe Checkout session for subscription
 */
export async function createCheckoutSession({
  priceId,
  customerId,
  publicationId,
  successUrl,
  cancelUrl,
}: {
  priceId: string
  customerId?: string
  publicationId: string
  successUrl: string
  cancelUrl: string
}) {
  const session = await stripe.checkout.sessions.create({
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
  const session = await stripe.billingPortal.sessions.create({
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
  const account = await stripe.accounts.create({
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
  const accountLink = await stripe.accountLinks.create({
    account: accountId,
    refresh_url: refreshUrl,
    return_url: returnUrl,
    type: 'account_onboarding',
  })

  return accountLink
}
