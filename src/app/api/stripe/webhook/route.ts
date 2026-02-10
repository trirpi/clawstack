import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import Stripe from 'stripe'
import { stripe } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  if (!stripe) {
    return NextResponse.json(
      { error: 'Stripe is not configured. Please set STRIPE_SECRET_KEY.' },
      { status: 503 }
    )
  }

  const stripeClient = stripe
  const body = await request.text()
  const headersList = await headers()
  const signature = headersList.get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
  }

  let event: Stripe.Event

  try {
    event = stripeClient.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET || ''
    )
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        await handleCheckoutComplete(stripeClient, session)
        break
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        await handleSubscriptionUpdate(subscription)
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        await handleSubscriptionDeleted(subscription)
        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Error processing webhook:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}

async function handleCheckoutComplete(
  stripeClient: Stripe,
  session: Stripe.Checkout.Session
) {
  const publicationId = session.metadata?.publicationId
  const userIdFromMetadata = session.metadata?.userId
  const customerId = session.customer as string
  const subscriptionId = session.subscription as string

  if (!publicationId || !customerId || !subscriptionId) {
    console.error('Missing required metadata in checkout session')
    return
  }

  let user = userIdFromMetadata
    ? await prisma.user.findUnique({
        where: { id: userIdFromMetadata },
      })
    : null

  if (!user) {
    user = await prisma.user.findFirst({
      where: { stripeCustomerId: customerId },
    })
  }

  if (!user) {
    const customer = await stripeClient.customers.retrieve(customerId)
    if (!customer.deleted && customer.email) {
      user = await prisma.user.findUnique({
        where: { email: customer.email },
      })
    }
  }

  if (!user) {
    console.error('User not found for customer:', customerId)
    return
  }

  // Update user with Stripe customer ID
  await prisma.user.update({
    where: { id: user.id },
    data: { stripeCustomerId: customerId },
  })

  // Create or update subscription
  await prisma.subscription.upsert({
    where: {
      userId_publicationId: {
        userId: user.id,
        publicationId,
      },
    },
    create: {
      userId: user.id,
      publicationId,
      tier: 'PAID',
      status: 'ACTIVE',
      stripeSubscriptionId: subscriptionId,
    },
    update: {
      tier: 'PAID',
      status: 'ACTIVE',
      stripeSubscriptionId: subscriptionId,
    },
  })
}

async function handleSubscriptionUpdate(subscription: Stripe.Subscription) {
  const existingSub = await prisma.subscription.findFirst({
    where: { stripeSubscriptionId: subscription.id },
  })

  if (!existingSub) return

  let status: string = 'ACTIVE'
  if (subscription.status === 'canceled') status = 'CANCELED'
  if (subscription.status === 'past_due') status = 'PAST_DUE'
  if (subscription.status === 'unpaid') status = 'UNPAID'

  // Get current period end from the subscription object
  const currentPeriodEnd = (subscription as unknown as { current_period_end?: number }).current_period_end

  await prisma.subscription.update({
    where: { id: existingSub.id },
    data: {
      status,
      currentPeriodEnd: currentPeriodEnd ? new Date(currentPeriodEnd * 1000) : undefined,
    },
  })
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const existingSub = await prisma.subscription.findFirst({
    where: { stripeSubscriptionId: subscription.id },
  })

  if (!existingSub) return

  await prisma.subscription.update({
    where: { id: existingSub.id },
    data: {
      status: 'CANCELED',
      tier: 'FREE',
    },
  })
}
