import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { createConnectAccount, createAccountLink } from '@/lib/stripe'

export async function POST() {
  try {
    const session = await getSession()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
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
  } catch (error) {
    console.error('Stripe connect error:', error)
    return NextResponse.json({ error: 'Failed to connect Stripe' }, { status: 500 })
  }
}
