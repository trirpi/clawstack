import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { createCheckoutSession } from '@/lib/stripe'

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { publicationId, priceId } = body

    // Get the publication
    const publication = await prisma.publication.findUnique({
      where: { id: publicationId },
    })

    if (!publication) {
      return NextResponse.json({ error: 'Publication not found' }, { status: 404 })
    }

    // Get or create Stripe customer
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    })

    const origin = request.headers.get('origin') || 'http://localhost:3000'

    const checkoutSession = await createCheckoutSession({
      priceId,
      customerId: user?.stripeCustomerId || undefined,
      publicationId,
      successUrl: `${origin}/${publication.slug}?subscribed=true`,
      cancelUrl: `${origin}/${publication.slug}`,
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
