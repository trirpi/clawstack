import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { hasSameOriginHeader, validateSettingsPayload } from '@/lib/validation'

export async function PUT(request: Request) {
  try {
    const session = await getSession()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    if (!hasSameOriginHeader(request)) {
      return NextResponse.json({ error: 'Invalid request origin' }, { status: 403 })
    }

    const payload = validateSettingsPayload(await request.json())
    if (!payload) {
      return NextResponse.json({ error: 'Invalid settings payload' }, { status: 400 })
    }
    const { publication, user } = payload

    // Update user
    if (user) {
      await prisma.user.update({
        where: { id: session.user.id },
        data: {
          name: user.name,
          bio: user.bio,
        },
      })
    }

    // Update publication
    if (publication) {
      await prisma.publication.updateMany({
        where: { userId: session.user.id },
        data: {
          name: publication.name,
          description: publication.description,
          priceMonthly: publication.priceMonthly,
          priceYearly: publication.priceYearly,
        },
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Settings update error:', error)
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 })
  }
}
