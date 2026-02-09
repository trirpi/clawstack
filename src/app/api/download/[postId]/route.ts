import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

interface Props {
  params: Promise<{ postId: string }>
}

export async function GET(request: NextRequest, { params }: Props) {
  const { postId } = await params

  const post = await prisma.post.findFirst({
    where: { id: postId, published: true },
    include: {
      publication: true,
    },
  })

  if (!post) {
    return NextResponse.json({ error: 'Post not found' }, { status: 404 })
  }

  // Only allow downloads for free posts or active paid subscribers
  if (post.visibility !== 'FREE') {
    const session = await getSession()

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

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
      return NextResponse.json(
        { error: 'This content requires a subscription' },
        { status: 403 }
      )
    }
  }

  // Extract code blocks from content for .claw file
  const codeBlockRegex = /<pre><code[^>]*>([\s\S]*?)<\/code><\/pre>/gi
  const codeBlocks: string[] = []
  let match

  while ((match = codeBlockRegex.exec(post.content)) !== null) {
    // Decode HTML entities
    const code = match[1]
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
    codeBlocks.push(code)
  }

  const clawFile = {
    version: '1.0',
    title: post.title,
    description: post.excerpt || '',
    author: post.publication.name,
    category: post.category,
    sourceUrl: `${process.env.NEXTAUTH_URL}/${post.publication.slug}/${post.slug}`,
    createdAt: post.createdAt.toISOString(),
    scripts: codeBlocks,
  }

  const filename = `${post.slug}.claw`

  return new NextResponse(JSON.stringify(clawFile, null, 2), {
    headers: {
      'Content-Type': 'application/json',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  })
}
