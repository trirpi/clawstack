import { NextResponse } from 'next/server'
import { getSession, getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Resend } from 'resend'
import { sanitizeHtmlBasic, sanitizePlainText } from '@/lib/sanitize'
import { hasSameOriginHeader, validateNewsletterPayload } from '@/lib/validation'
import { consumeRateLimit, rateLimitResponse } from '@/lib/rateLimit'

const resend = process.env.RESEND_API_KEY 
  ? new Resend(process.env.RESEND_API_KEY)
  : null

export async function POST(request: Request) {
  try {
    const session = await getSession()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    if (!hasSameOriginHeader(request)) {
      return NextResponse.json({ error: 'Invalid request origin' }, { status: 403 })
    }
    const rateLimit = consumeRateLimit({
      request,
      key: 'api:newsletter:send',
      limit: 12,
      windowMs: 60 * 60 * 1000,
      identifier: session.user.id,
    })
    if (!rateLimit.allowed) {
      return rateLimitResponse(rateLimit, 'Too many newsletter sends. Please try again later.')
    }

    const user = await getCurrentUser()
    
    if (!user?.publication) {
      return NextResponse.json({ error: 'No publication found' }, { status: 400 })
    }

    const payload = validateNewsletterPayload(await request.json())
    if (!payload) {
      return NextResponse.json({ error: 'Invalid newsletter payload' }, { status: 400 })
    }
    const { subject, content } = payload
    const safeSubject = sanitizePlainText(subject).slice(0, 180)
    const safeHtml = sanitizeHtmlBasic(content.replace(/\n/g, '<br>'))

    // Get all subscribers with email
    const subscribers = await prisma.subscription.findMany({
      where: {
        publicationId: user.publication.id,
        status: 'ACTIVE',
      },
      include: {
        user: {
          select: { email: true, name: true },
        },
      },
    })

    if (subscribers.length === 0) {
      return NextResponse.json({ error: 'No subscribers to send to' }, { status: 400 })
    }

    if (!resend) {
      return NextResponse.json({ 
        error: 'Email service not configured. Set RESEND_API_KEY environment variable.' 
      }, { status: 500 })
    }

    // Send emails to all subscribers
    type Subscriber = (typeof subscribers)[number]
    const emails = subscribers.map((sub: Subscriber) => sub.user.email)
    const safePublicationName = sanitizePlainText(user.publication.name).slice(0, 100) || 'Clawstack'
    
    // Resend supports batch sending
    const { error } = await resend.emails.send({
      from: `${safePublicationName} <newsletter@clawstack.com>`,
      to: emails,
      subject: safeSubject,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="border-bottom: 2px solid #ea580c; padding-bottom: 20px; margin-bottom: 20px;">
              <h1 style="margin: 0; color: #111827;">${safePublicationName}</h1>
            </div>
            <div style="color: #374151; line-height: 1.6;">
              ${safeHtml}
            </div>
            <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #9ca3af; font-size: 12px;">
              <p>You received this email because you're subscribed to ${safePublicationName} on Clawstack.</p>
            </div>
          </body>
        </html>
      `,
    })

    if (error) {
      console.error('Failed to send newsletter:', error)
      return NextResponse.json({ error: 'Failed to send emails' }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      sent: subscribers.length 
    })
  } catch (error) {
    console.error('Newsletter send error:', error)
    return NextResponse.json({ error: 'Failed to send newsletter' }, { status: 500 })
  }
}
