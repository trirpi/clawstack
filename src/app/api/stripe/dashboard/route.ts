import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { stripe } from '@/lib/stripe'

export async function POST() {
  try {
    const session = await getSession()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!stripe) {
      return NextResponse.json(
        { error: 'Stripe is not configured. Please set STRIPE_SECRET_KEY.' },
        { status: 503 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    })

    if (!user?.stripeAccountId) {
      return NextResponse.json({ error: 'No Stripe account connected' }, { status: 400 })
    }

    // Create login link to Stripe Express dashboard
    const loginLink = await stripe.accounts.createLoginLink(user.stripeAccountId)

    return NextResponse.json({ url: loginLink.url })
  } catch (error: unknown) {
    console.error('Stripe dashboard error:', error)
    
    let errorMessage = 'Failed to create dashboard link'
    if (error && typeof error === 'object' && 'message' in error) {
      errorMessage = (error as { message: string }).message
    }
    
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}
