import { NextRequest, NextResponse } from 'next/server'
import { getSession, getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Resend } from 'resend'

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await getCurrentUser()
    
    if (!user?.publication) {
      return NextResponse.json({ error: 'No publication found' }, { status: 404 })
    }

    const { postId } = await request.json()

    if (!postId) {
      return NextResponse.json({ error: 'Post ID is required' }, { status: 400 })
    }

    // Get the post
    const post = await prisma.post.findFirst({
      where: {
        id: postId,
        publicationId: user.publication.id,
        published: true,
      },
    })

    if (!post) {
      return NextResponse.json({ error: 'Post not found or not published' }, { status: 404 })
    }

    // Get all subscribers
    const subscribers = await prisma.subscription.findMany({
      where: { publicationId: user.publication.id },
      include: {
        user: {
          select: {
            email: true,
            name: true,
          },
        },
      },
    })

    if (subscribers.length === 0) {
      return NextResponse.json({ error: 'No subscribers to send to' }, { status: 400 })
    }

    // Check if Resend is configured
    if (!resend) {
      return NextResponse.json(
        { error: 'Email service not configured. Please set RESEND_API_KEY.' },
        { status: 503 }
      )
    }

    // Send emails to all subscribers
    const baseUrl = process.env.NEXTAUTH_URL || 'https://clawstack.vercel.app'
    const postUrl = `${baseUrl}/${user.publication.slug}/${post.slug}`
    type Subscriber = (typeof subscribers)[number]
    
    const emails = subscribers.map((sub: Subscriber) => sub.user.email)
    
    // Strip HTML tags for plain text version
    const plainContent = post.content.replace(/<[^>]*>/g, '').substring(0, 500)

    await resend.emails.send({
      from: `${user.publication.name} <newsletter@resend.dev>`,
      to: emails,
      subject: post.title,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #111; font-size: 24px;">${post.title}</h1>
          <div style="color: #444; line-height: 1.6;">
            ${post.content}
          </div>
          <hr style="border: none; border-top: 1px solid #eee; margin: 32px 0;" />
          <p style="color: #666; font-size: 14px;">
            <a href="${postUrl}" style="color: #f97316;">Read on Clawstack</a>
          </p>
          <p style="color: #999; font-size: 12px;">
            You're receiving this because you subscribed to ${user.publication.name}.
          </p>
        </div>
      `,
      text: `${post.title}\n\n${plainContent}...\n\nRead more: ${postUrl}`,
    })

    return NextResponse.json({ 
      success: true, 
      message: `Newsletter sent to ${subscribers.length} subscriber${subscribers.length === 1 ? '' : 's'}` 
    })
  } catch (error) {
    console.error('Send post as newsletter error:', error)
    
    let errorMessage = 'Failed to send newsletter'
    if (error && typeof error === 'object' && 'message' in error) {
      errorMessage = (error as { message: string }).message
    }
    
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}
