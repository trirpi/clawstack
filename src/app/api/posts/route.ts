import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { sanitizeHtmlBasic } from '@/lib/sanitize'
import { hasSameOriginHeader, validatePostPayload } from '@/lib/validation'
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
    key: 'api:posts:create',
    limit: 30,
    windowMs: 10 * 60 * 1000,
    identifier: session.user.id,
  })
  if (!rateLimit.allowed) {
    return rateLimitResponse(rateLimit, 'Too many post creation requests.')
  }

  try {
    const payload = validatePostPayload(await request.json())
    if (!payload || !payload.publicationId) {
      return NextResponse.json({ error: 'Invalid post payload' }, { status: 400 })
    }
    const {
      publicationId,
      title,
      slug,
      content,
      excerpt,
      category,
      visibility,
      published,
    } = payload
    const moderationResult = scanTextForPolicyViolations([title, excerpt || '', content].join('\n'))
    if (moderationResult.blocked) {
      return NextResponse.json(
        {
          error: 'Post content violates the Acceptable Use Policy.',
          reasons: moderationResult.findings.map((item) => item.reason),
          details: formatModerationSummary(moderationResult.findings),
        },
        { status: 400 },
      )
    }

    // Verify the user owns this publication
    const publication = await prisma.publication.findUnique({
      where: { id: publicationId },
    })

    if (!publication || publication.userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Check for slug uniqueness within publication
    const existingPost = await prisma.post.findUnique({
      where: {
        publicationId_slug: {
          publicationId,
          slug,
        },
      },
    })

    let finalSlug = slug
    if (existingPost) {
      finalSlug = `${slug}-${Date.now()}`
    }

    const post = await prisma.post.create({
      data: {
        title,
        slug: finalSlug,
        content: sanitizeHtmlBasic(content),
        excerpt: excerpt || null,
        category,
        visibility,
        published,
        publishedAt: published ? new Date() : null,
        publicationId,
      },
    })

    return NextResponse.json(post)
  } catch (error) {
    console.error('Error creating post:', error)
    return NextResponse.json(
      { error: 'Failed to create post' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  if (!hasSameOriginHeader(request)) {
    return NextResponse.json({ error: 'Invalid request origin' }, { status: 403 })
  }
  const rateLimit = consumeRateLimit({
    request,
    key: 'api:posts:update',
    limit: 60,
    windowMs: 10 * 60 * 1000,
    identifier: session.user.id,
  })
  if (!rateLimit.allowed) {
    return rateLimitResponse(rateLimit, 'Too many post update requests.')
  }

  try {
    const payload = validatePostPayload(await request.json())
    if (!payload?.id) {
      return NextResponse.json({ error: 'Invalid post payload' }, { status: 400 })
    }
    const {
      id,
      title,
      slug,
      content,
      excerpt,
      category,
      visibility,
      published,
    } = payload
    const moderationResult = scanTextForPolicyViolations([title, excerpt || '', content].join('\n'))
    if (moderationResult.blocked) {
      return NextResponse.json(
        {
          error: 'Post content violates the Acceptable Use Policy.',
          reasons: moderationResult.findings.map((item) => item.reason),
          details: formatModerationSummary(moderationResult.findings),
        },
        { status: 400 },
      )
    }

    // Get the post and verify ownership
    const existingPost = await prisma.post.findUnique({
      where: { id },
      include: { publication: true },
    })

    if (!existingPost || existingPost.publication.userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    let finalSlug = slug
    if (slug) {
      const slugConflict = await prisma.post.findUnique({
        where: {
          publicationId_slug: {
            publicationId: existingPost.publicationId,
            slug,
          },
        },
      })

      if (slugConflict && slugConflict.id !== existingPost.id) {
        finalSlug = `${slug}-${Date.now()}`
      }
    }

    const post = await prisma.post.update({
      where: { id },
      data: {
        title,
        slug: finalSlug,
        content: sanitizeHtmlBasic(content),
        excerpt: excerpt || null,
        category,
        visibility,
        published,
        publishedAt: published
          ? existingPost.publishedAt || new Date()
          : null,
      },
    })

    return NextResponse.json(post)
  } catch (error) {
    console.error('Error updating post:', error)
    return NextResponse.json(
      { error: 'Failed to update post' },
      { status: 500 }
    )
  }
}
