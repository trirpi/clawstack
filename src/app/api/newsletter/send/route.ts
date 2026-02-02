import { NextResponse } from 'next/server'
import { getSession, getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Resend } from 'resend'

const resend = process.env.RESEND_API_KEY 
  ? new Resend(process.env.RESEND_API_KEY)
  : null

export async function POST(request: Request) {
  try {
    const session = await getSession()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await getCurrentUser()
    
    if (!user?.publication) {
      return NextResponse.json({ error: 'No publication found' }, { status: 400 })
    }

    const { subject, content } = await request.json()

    if (!subject || !content) {
      return NextResponse.json({ error: 'Subject and content are required' }, { status: 400 })
    }

    // Get all subscribers with email
    const subscribers = await prisma.subscription.findMany({
      where: { publicationId: user.publication.id },
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
    const emails = subscribers.map((sub) => sub.user.email)
    
    // Resend supports batch sending
    const { error } = await resend.emails.send({
      from: `${user.publication.name} <newsletter@clawstack.com>`,
      to: emails,
      subject: subject,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="border-bottom: 2px solid #ea580c; padding-bottom: 20px; margin-bottom: 20px;">
              <h1 style="margin: 0; color: #111827;">${user.publication.name}</h1>
            </div>
            <div style="color: #374151; line-height: 1.6;">
              ${content.replace(/\n/g, '<br>')}
            </div>
            <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #9ca3af; font-size: 12px;">
              <p>You received this email because you're subscribed to ${user.publication.name} on Clawstack.</p>
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
