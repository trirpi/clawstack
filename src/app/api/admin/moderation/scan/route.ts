import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { consumeRateLimit, rateLimitResponse } from '@/lib/rateLimit'
import { formatModerationSummary, scanTextForPolicyViolations } from '@/lib/moderationScan'
import { hasSameOriginHeader } from '@/lib/validation'

const SYSTEM_REPORTER_IP = 'system:auto'
const SCAN_LIMIT = 200

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  if (session.user.isPlatformAdmin !== true) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }
  if (!hasSameOriginHeader(request)) {
    return NextResponse.json({ error: 'Invalid request origin' }, { status: 403 })
  }

  const rateLimit = consumeRateLimit({
    request,
    key: 'api:admin:moderation-scan',
    limit: 10,
    windowMs: 60 * 60 * 1000,
    identifier: session.user.id,
  })
  if (!rateLimit.allowed) {
    return rateLimitResponse(rateLimit, 'Too many moderation scan requests. Please try again later.')
  }

  const posts = await prisma.post.findMany({
    where: { published: true },
    take: SCAN_LIMIT,
    include: {
      publication: {
        select: {
          id: true,
          slug: true,
        },
      },
    },
    orderBy: { publishedAt: 'desc' },
  })

  let scanned = 0
  let flaggedPosts = 0
  let unpublishedPosts = 0
  let createdReports = 0

  for (const post of posts) {
    scanned += 1
    const moderation = scanTextForPolicyViolations([post.title, post.excerpt || '', post.content].join('\n'))
    if (!moderation.blocked) {
      continue
    }

    flaggedPosts += 1
    if (post.published) {
      await prisma.post.update({
        where: { id: post.id },
        data: {
          published: false,
          publishedAt: null,
        },
      })
      unpublishedPosts += 1
    }

    for (const finding of moderation.findings) {
      const existing = await prisma.report.findFirst({
        where: {
          postId: post.id,
          publicationId: post.publicationId,
          reason: finding.reason,
          reporterIp: SYSTEM_REPORTER_IP,
          status: { in: ['OPEN', 'IN_REVIEW'] },
        },
        select: { id: true },
      })

      if (existing) continue

      await prisma.report.create({
        data: {
          postId: post.id,
          publicationId: post.publicationId,
          reason: finding.reason,
          details: `Automated scan match: ${formatModerationSummary([finding])}`,
          postSlug: post.slug,
          publicationSlug: post.publication.slug,
          sourceUrl: `${process.env.NEXTAUTH_URL || ''}/${post.publication.slug}/${post.slug}`,
          reporterIp: SYSTEM_REPORTER_IP,
          status: 'IN_REVIEW',
        },
      })
      createdReports += 1
    }
  }

  return NextResponse.json({
    success: true,
    scanned,
    flaggedPosts,
    unpublishedPosts,
    createdReports,
  })
}
