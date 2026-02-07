import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const {
      publicationId,
      title,
      slug,
      content,
      excerpt,
      category,
      visibility,
      published,
    } = body

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
        content,
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

  try {
    const body = await request.json()
    const {
      id,
      title,
      slug,
      content,
      excerpt,
      category,
      visibility,
      published,
    } = body

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
        content,
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
