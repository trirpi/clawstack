import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { hasSameOriginHeader, validateCommentPayload } from '@/lib/validation'
import { sanitizePlainText } from '@/lib/sanitize'

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  if (!hasSameOriginHeader(request)) {
    return NextResponse.json({ error: 'Invalid request origin' }, { status: 403 })
  }

  try {
    const payload = validateCommentPayload(await request.json())
    if (!payload) {
      return NextResponse.json({ error: 'Invalid comment payload' }, { status: 400 })
    }
    const { postId, content } = payload

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

    const comment = await prisma.comment.create({
      data: {
        content: sanitizePlainText(content).slice(0, 4000),
        userId: session.user.id,
        postId,
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

  try {
    const { searchParams } = new URL(request.url)
    const commentId = searchParams.get('id')

    if (!commentId) {
      return NextResponse.json({ error: 'Comment ID is required' }, { status: 400 })
    }

    // Verify ownership
    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
    })

    if (!comment || comment.userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
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
