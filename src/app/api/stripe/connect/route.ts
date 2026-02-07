import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { stripe, createConnectAccount, createAccountLink } from '@/lib/stripe'

export async function POST() {
  try {
    const session = await getSession()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if Stripe is configured
    if (!stripe) {
      return NextResponse.json(
        { error: 'Stripe is not configured. Please set STRIPE_SECRET_KEY in environment variables.' },
        { status: 503 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    let accountId = user.stripeAccountId

    // Create new Stripe Connect account if doesn't exist
    if (!accountId) {
      const account = await createConnectAccount({
        email: user.email,
        userId: user.id,
      })
      accountId = account.id

      await prisma.user.update({
        where: { id: user.id },
        data: { stripeAccountId: accountId },
      })
    }

    // Create account link for onboarding
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
    const accountLink = await createAccountLink({
      accountId,
      refreshUrl: `${baseUrl}/dashboard/earnings`,
      returnUrl: `${baseUrl}/dashboard/earnings`,
    })

    return NextResponse.json({ url: accountLink.url })
  } catch (error: unknown) {
    console.error('Stripe connect error:', error)
    
    // Get detailed error message
    let errorMessage = 'Failed to connect Stripe'
    if (error && typeof error === 'object' && 'message' in error) {
      errorMessage = (error as { message: string }).message
    }
    
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}
