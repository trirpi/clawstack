import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sanitizePlainText } from '@/lib/sanitize'
import { hasSameOriginHeader, validateReportPayload } from '@/lib/validation'

const MAX_REPORTS_PER_IP_PER_DAY = 10

export async function POST(request: Request) {
  if (!hasSameOriginHeader(request)) {
    return NextResponse.json({ error: 'Invalid request origin' }, { status: 403 })
  }

  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'unknown'
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const reportCount = await prisma.report.count({
    where: {
      reporterIp: ip,
      createdAt: { gte: today },
    },
  })

  if (reportCount >= MAX_REPORTS_PER_IP_PER_DAY) {
    return NextResponse.json({ error: 'Report limit reached for today.' }, { status: 429 })
  }

  const payload = validateReportPayload(await request.json().catch(() => null))
  if (!payload) {
    return NextResponse.json({ error: 'Invalid report payload' }, { status: 400 })
  }

  const report = await prisma.report.create({
    data: {
      postId: payload.postId,
      publicationId: payload.publicationId,
      reason: sanitizePlainText(payload.reason).slice(0, 50),
      reporterEmail: payload.reporterEmail ? sanitizePlainText(payload.reporterEmail).slice(0, 200) : null,
      details: payload.details ? sanitizePlainText(payload.details).slice(0, 2000) : null,
      postSlug: payload.postSlug ?? null,
      publicationSlug: payload.publicationSlug ?? null,
      sourceUrl: payload.sourceUrl ?? null,
      reporterIp: ip,
      status: 'OPEN',
    },
  })

  return NextResponse.json({ success: true, id: report.id })
}
