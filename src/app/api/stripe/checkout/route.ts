import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { createCheckoutSession } from '@/lib/stripe'
import { hasSameOriginHeader } from '@/lib/validation'

function getAllowedStripePriceIds() {
  return [process.env.STRIPE_PRICE_MONTHLY_ID, process.env.STRIPE_PRICE_YEARLY_ID]
    .map((value) => (typeof value === 'string' ? value.trim() : ''))
    .filter(Boolean)
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  if (!hasSameOriginHeader(request)) {
    return NextResponse.json({ error: 'Invalid request origin' }, { status: 403 })
  }

  try {
    const body = await request.json()
    const publicationId = typeof body?.publicationId === 'string' ? body.publicationId.trim() : ''
    const priceId = typeof body?.priceId === 'string' ? body.priceId.trim() : ''
    if (!publicationId || !priceId) {
      return NextResponse.json({ error: 'Invalid checkout payload' }, { status: 400 })
    }

    const allowedPriceIds = getAllowedStripePriceIds()
    if (process.env.NODE_ENV === 'production' && allowedPriceIds.length === 0) {
      return NextResponse.json({ error: 'Billing is not configured' }, { status: 503 })
    }

    if (!allowedPriceIds.includes(priceId)) {
      return NextResponse.json({ error: 'Invalid price selection' }, { status: 400 })
    }

    // Get the publication
    const publication = await prisma.publication.findUnique({
      where: { id: publicationId },
    })

    if (!publication) {
      return NextResponse.json({ error: 'Publication not found' }, { status: 404 })
    }

    if (priceId === process.env.STRIPE_PRICE_MONTHLY_ID && !publication.priceMonthly) {
      return NextResponse.json({ error: 'Monthly plan is not available for this publication' }, { status: 400 })
    }
    if (priceId === process.env.STRIPE_PRICE_YEARLY_ID && !publication.priceYearly) {
      return NextResponse.json({ error: 'Yearly plan is not available for this publication' }, { status: 400 })
    }

    // Get or create Stripe customer
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    })

    if (publication.userId === session.user.id) {
      return NextResponse.json({ error: 'Cannot subscribe to your own publication' }, { status: 400 })
    }

    const appBaseUrl = process.env.NEXTAUTH_URL || request.nextUrl.origin

    const checkoutSession = await createCheckoutSession({
      priceId,
      customerId: user?.stripeCustomerId || undefined,
      userId: session.user.id,
      publicationId,
      successUrl: `${appBaseUrl}/${publication.slug}?subscribed=true`,
      cancelUrl: `${appBaseUrl}/${publication.slug}`,
    })

    return NextResponse.json({ url: checkoutSession.url })
  } catch (error) {
    console.error('Error creating checkout session:', error)
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}
