import { NextResponse } from 'next/server'
import { getSession, getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { hasSameOriginHeader } from '@/lib/validation'
import { REPORT_STATUS_VALUES, type ReportStatus } from '@/lib/moderation'

function isValidStatus(value: string): value is ReportStatus {
  return REPORT_STATUS_VALUES.includes(value as ReportStatus)
}

interface Props {
  params: Promise<{ id: string }>
}

export async function POST(request: Request, { params }: Props) {
  const session = await getSession()

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const isPlatformAdmin = session.user.isPlatformAdmin === true

  if (!hasSameOriginHeader(request)) {
    return NextResponse.json({ error: 'Invalid request origin' }, { status: 403 })
  }

  const user = await getCurrentUser()
  if (!isPlatformAdmin && !user?.publication) {
    return NextResponse.json({ error: 'No publication found' }, { status: 404 })
  }

  const { id } = await params
  const formData = await request.formData()
  const action = String(formData.get('action') || '').trim()
  const status = String(formData.get('status') || '').trim()

  const report = await prisma.report.findUnique({
    where: { id },
    select: { publicationId: true, postId: true },
  })

  if (!report) {
    return NextResponse.json({ error: 'Report not found' }, { status: 404 })
  }

  if (!isPlatformAdmin && report.publicationId !== user?.publication?.id) {
    return NextResponse.json({ error: 'Report not found' }, { status: 404 })
  }

  if (action === 'TAKEDOWN_RESOLVE') {
    await prisma.$transaction([
      prisma.post.update({
        where: { id: report.postId },
        data: { published: false, publishedAt: null },
      }),
      prisma.report.update({
        where: { id },
        data: { status: 'RESOLVED' },
      }),
    ])
  } else {
    if (!isValidStatus(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
    }

    await prisma.report.update({
      where: { id },
      data: { status },
    })
  }

  return NextResponse.redirect(new URL('/dashboard/reports', request.url))
}
