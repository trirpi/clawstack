import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { hasSameOriginHeader } from '@/lib/validation'
import { consumeRateLimit, rateLimitResponse } from '@/lib/rateLimit'

function getPublicationId(request: Request) {
  const url = new URL(request.url)
  return url.searchParams.get('publicationId')?.trim() || ''
}

export async function POST(request: Request) {
  const session = await getSession()

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  if (!hasSameOriginHeader(request)) {
    return NextResponse.json({ error: 'Invalid request origin' }, { status: 403 })
  }
  const rateLimit = consumeRateLimit({
    request,
    key: 'api:subscriptions:create',
    limit: 50,
    windowMs: 10 * 60 * 1000,
    identifier: session.user.id,
  })
  if (!rateLimit.allowed) {
    return rateLimitResponse(rateLimit, 'Too many subscription requests.')
  }

  const publicationId = getPublicationId(request)
  if (!publicationId) {
    return NextResponse.json({ error: 'publicationId is required' }, { status: 400 })
  }

  const publication = await prisma.publication.findUnique({
    where: { id: publicationId },
    select: { id: true, userId: true },
  })

  if (!publication) {
    return NextResponse.json({ error: 'Publication not found' }, { status: 404 })
  }

  if (publication.userId === session.user.id) {
    return NextResponse.json({ error: 'Cannot subscribe to your own publication' }, { status: 400 })
  }

  const subscription = await prisma.subscription.upsert({
    where: {
      userId_publicationId: {
        userId: session.user.id,
        publicationId,
      },
    },
    create: {
      userId: session.user.id,
      publicationId,
      tier: 'FREE',
      status: 'ACTIVE',
    },
    update: {
      status: 'ACTIVE',
    },
    select: {
      id: true,
      tier: true,
      status: true,
    },
  })

  return NextResponse.json({ success: true, subscription })
}

export async function DELETE(request: Request) {
  const session = await getSession()

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  if (!hasSameOriginHeader(request)) {
    return NextResponse.json({ error: 'Invalid request origin' }, { status: 403 })
  }
  const rateLimit = consumeRateLimit({
    request,
    key: 'api:subscriptions:delete',
    limit: 50,
    windowMs: 10 * 60 * 1000,
    identifier: session.user.id,
  })
  if (!rateLimit.allowed) {
    return rateLimitResponse(rateLimit, 'Too many subscription requests.')
  }

  const publicationId = getPublicationId(request)
  if (!publicationId) {
    return NextResponse.json({ error: 'publicationId is required' }, { status: 400 })
  }

  await prisma.subscription.deleteMany({
    where: {
      userId: session.user.id,
      publicationId,
    },
  })

  return NextResponse.json({ success: true })
}
