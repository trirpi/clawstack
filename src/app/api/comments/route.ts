import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { hasSameOriginHeader, validateCommentPayload } from '@/lib/validation'
import { sanitizePlainText } from '@/lib/sanitize'
import { consumeRateLimit, rateLimitResponse } from '@/lib/rateLimit'
import { formatModerationSummary, scanTextForPolicyViolations } from '@/lib/moderationScan'

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
    key: 'api:comments:create',
    limit: 30,
    windowMs: 10 * 60 * 1000,
    identifier: session.user.id,
  })
  if (!rateLimit.allowed) {
    return rateLimitResponse(rateLimit, 'Too many comments. Please try again shortly.')
  }

  try {
    const payload = validateCommentPayload(await request.json())
    if (!payload) {
      return NextResponse.json({ error: 'Invalid comment payload' }, { status: 400 })
    }
    const { postId, content, parentId } = payload
    const moderationResult = scanTextForPolicyViolations(content)
    if (moderationResult.blocked) {
      return NextResponse.json(
        {
          error: 'Comment violates the Acceptable Use Policy.',
          reasons: moderationResult.findings.map((item) => item.reason),
          details: formatModerationSummary(moderationResult.findings),
        },
        { status: 400 },
      )
    }

    // Verify the post exists and enforce visibility access.
    const post = await prisma.post.findUnique({
      where: { id: postId },
      include: { publication: true },
    })

    if (!post || !post.published) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }

    if (post.visibility !== 'FREE') {
      const subscription = await prisma.subscription.findUnique({
        where: {
          userId_publicationId: {
            userId: session.user.id,
            publicationId: post.publicationId,
          },
        },
      })
      const hasAccess =
        post.publication.userId === session.user.id ||
        (subscription?.tier === 'PAID' && subscription?.status === 'ACTIVE')

      if (!hasAccess) {
        return NextResponse.json({ error: 'Subscription required' }, { status: 403 })
      }
    }

    if (parentId) {
      const parent = await prisma.comment.findUnique({
        where: { id: parentId },
        select: { id: true, postId: true },
      })
      if (!parent || parent.postId !== postId) {
        return NextResponse.json({ error: 'Invalid parent comment' }, { status: 400 })
      }
    }

    const comment = await prisma.comment.create({
      data: {
        content: sanitizePlainText(content).slice(0, 4000),
        userId: session.user.id,
        postId,
        parentId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    })

    return NextResponse.json(comment)
  } catch (error) {
    console.error('Error creating comment:', error)
    return NextResponse.json(
      { error: 'Failed to create comment' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  if (!hasSameOriginHeader(request)) {
    return NextResponse.json({ error: 'Invalid request origin' }, { status: 403 })
  }
  const rateLimit = consumeRateLimit({
    request,
    key: 'api:comments:delete',
    limit: 50,
    windowMs: 10 * 60 * 1000,
    identifier: session.user.id,
  })
  if (!rateLimit.allowed) {
    return rateLimitResponse(rateLimit, 'Too many requests. Please try again shortly.')
  }

  try {
    const { searchParams } = new URL(request.url)
    const commentId = searchParams.get('id')

    if (!commentId) {
      return NextResponse.json({ error: 'Comment ID is required' }, { status: 400 })
    }

    // Verify ownership
    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
      include: {
        replies: {
          select: { id: true },
          take: 1,
        },
      },
    })

    if (!comment || comment.userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    if (comment.replies.length > 0) {
      return NextResponse.json({ error: 'Cannot delete a comment with replies' }, { status: 400 })
    }

    await prisma.comment.delete({
      where: { id: commentId },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting comment:', error)
    return NextResponse.json(
      { error: 'Failed to delete comment' },
      { status: 500 }
    )
  }
}
