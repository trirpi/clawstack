import { NextResponse } from 'next/server'
import { getSession, getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getSession()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await getCurrentUser()
    
    if (!user?.publication) {
      return NextResponse.json({ error: 'No publication found' }, { status: 404 })
    }

    // Get all subscribers with user details
    const subscribers = await prisma.subscription.findMany({
      where: { publicationId: user.publication.id },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    // Generate CSV content
    const csvHeader = 'Name,Email,Tier,Status,Subscribed Date\n'
    type Subscriber = (typeof subscribers)[number]
    const csvRows = subscribers.map((sub: Subscriber) => {
      const name = (sub.user.name || 'Anonymous').replace(/,/g, ' ')
      const email = sub.user.email
      const tier = sub.tier
      const status = sub.status
      const date = sub.createdAt.toISOString().split('T')[0]
      return `"${name}","${email}","${tier}","${status}","${date}"`
    }).join('\n')

    const csv = csvHeader + csvRows

    // Return as downloadable file
    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="subscribers-${new Date().toISOString().split('T')[0]}.csv"`,
      },
    })
  } catch (error) {
    console.error('Export subscribers error:', error)
    return NextResponse.json({ error: 'Failed to export subscribers' }, { status: 500 })
  }
}
