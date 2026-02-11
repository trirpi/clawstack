import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { consumeRateLimit, rateLimitResponse } from '@/lib/rateLimit'
import { hasSameOriginHeader } from '@/lib/validation'

const DEMO_EMAIL = 'demo.creator@clawstack.local'
const DEMO_PUBLICATION_SLUG = 'demo-lab'

function buildDemoPosts(publicationId: string) {
  return [
    {
      publicationId,
      title: 'Prompt Release Notes: v0.4',
      slug: 'prompt-release-notes-v0-4',
      excerpt: 'Changelog with rollout checklist and known caveats.',
      content:
        '<p>This is a demo post used for end-to-end subscription checks.</p><ul><li>Added fallback guardrails</li><li>Improved retrieval quality</li></ul>',
      category: 'PROMPT',
      visibility: 'FREE',
      published: true,
      publishedAt: new Date(),
    },
    {
      publicationId,
      title: 'Operations Playbook: Incident 17',
      slug: 'operations-playbook-incident-17',
      excerpt: 'Private paid example used to validate gated content access.',
      content:
        '<p>Paid demo content for checkout/subscription verification.</p><pre><code class="language-bash">echo \"simulate paid workflow\"</code></pre>',
      category: 'CONFIG',
      visibility: 'PAID',
      published: true,
      publishedAt: new Date(),
    },
  ]
}

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
    key: 'api:admin:seed-demo',
    limit: 10,
    windowMs: 60 * 60 * 1000,
    identifier: session.user.id,
  })
  if (!rateLimit.allowed) {
    return rateLimitResponse(rateLimit, 'Too many seed operations. Please try again later.')
  }

  const demoUser = await prisma.user.upsert({
    where: { email: DEMO_EMAIL },
    update: {
      name: 'Clawstack Demo Creator',
    },
    create: {
      email: DEMO_EMAIL,
      name: 'Clawstack Demo Creator',
      bio: 'Demo account used for subscription and moderation QA flows.',
    },
  })

  let publication = await prisma.publication.findFirst({
    where: { userId: demoUser.id },
  })

  if (!publication) {
    publication = await prisma.publication.create({
      data: {
        userId: demoUser.id,
        slug: DEMO_PUBLICATION_SLUG,
        name: 'Demo Lab',
        description: 'A demo publication for validating signup, subscribe, and moderation flows.',
        priceMonthly: 700,
        priceYearly: 7000,
      },
    })
  }

  const existingPosts = await prisma.post.count({
    where: { publicationId: publication.id },
  })

  if (existingPosts === 0) {
    await prisma.post.createMany({
      data: buildDemoPosts(publication.id),
    })
  }

  await prisma.subscription.upsert({
    where: {
      userId_publicationId: {
        userId: session.user.id,
        publicationId: publication.id,
      },
    },
    create: {
      userId: session.user.id,
      publicationId: publication.id,
      tier: 'PAID',
      status: 'ACTIVE',
    },
    update: {
      tier: 'PAID',
      status: 'ACTIVE',
    },
  })

  const finalPostCount = await prisma.post.count({
    where: { publicationId: publication.id },
  })

  return NextResponse.json({
    success: true,
    publicationSlug: publication.slug,
    demoEmail: demoUser.email,
    postCount: finalPostCount,
    message: 'Demo publication is ready. Your admin account is subscribed to it.',
  })
}
