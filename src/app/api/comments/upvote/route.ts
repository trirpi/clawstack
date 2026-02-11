import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { consumeRateLimit, rateLimitResponse } from '@/lib/rateLimit'
import { hasSameOriginHeader, validateCommentVotePayload } from '@/lib/validation'

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  if (!hasSameOriginHeader(request)) {
    return NextResponse.json({ error: 'Invalid request origin' }, { status: 403 })
  }
  const rateLimit = consumeRateLimit({
    request,
    key: 'api:comments:upvote',
    limit: 120,
    windowMs: 10 * 60 * 1000,
    identifier: session.user.id,
  })
  if (!rateLimit.allowed) {
    return rateLimitResponse(rateLimit, 'Too many vote requests. Please try again shortly.')
  }

  const payload = validateCommentVotePayload(await request.json().catch(() => null))
  if (!payload) {
    return NextResponse.json({ error: 'Invalid vote payload' }, { status: 400 })
  }

  const comment = await prisma.comment.findUnique({
    where: { id: payload.commentId },
    include: {
      post: {
        include: {
          publication: true,
        },
      },
    },
  })

  if (!comment || !comment.post.published) {
    return NextResponse.json({ error: 'Comment not found' }, { status: 404 })
  }

  if (comment.post.visibility !== 'FREE') {
    const subscription = await prisma.subscription.findUnique({
      where: {
        userId_publicationId: {
          userId: session.user.id,
          publicationId: comment.post.publicationId,
        },
      },
      select: { tier: true, status: true },
    })

    const hasAccess =
      comment.post.publication.userId === session.user.id ||
      (subscription?.tier === 'PAID' && subscription?.status === 'ACTIVE')

    if (!hasAccess) {
      return NextResponse.json({ error: 'Subscription required' }, { status: 403 })
    }
  }

  const existing = await prisma.commentUpvote.findUnique({
    where: {
      userId_commentId: {
        userId: session.user.id,
        commentId: payload.commentId,
      },
    },
    select: { id: true },
  })

  let voted = false
  if (existing) {
    await prisma.commentUpvote.delete({
      where: { id: existing.id },
    })
  } else {
    await prisma.commentUpvote.create({
      data: {
        userId: session.user.id,
        commentId: payload.commentId,
      },
    })
    voted = true
  }

  const count = await prisma.commentUpvote.count({
    where: { commentId: payload.commentId },
  })

  return NextResponse.json({ success: true, voted, count })
}
