import Image from 'next/image'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { Button } from '@/components/ui/Button'
import { SubscribeButton } from '@/components/content/SubscribeButton'
import { formatDate } from '@/lib/utils'
import { sanitizeHtmlBasic } from '@/lib/sanitize'
import { ReportDialog } from '@/components/content/ReportDialog'
import { CommentForm } from '@/components/content/CommentForm'

interface Props {
  params: Promise<{ username: string; slug: string }>
}

export default async function PostPage({ params }: Props) {
  const { username, slug: postSlug } = await params

  const post = await prisma.post.findFirst({
    where: {
      slug: postSlug,
      publication: { slug: username },
      published: true,
    },
    include: {
      publication: {
        include: { user: true },
      },
      comments: {
        include: { user: true },
        orderBy: { createdAt: 'desc' },
      },
    },
  })

  if (!post) {
    notFound()
  }
  type PostComment = (typeof post.comments)[number]

  const session = await getSession()
  const isOwner = session?.user?.id === post.publication.userId

  // Check if user has access to paid content
  let hasAccess = post.visibility === 'FREE'
  let existingSubscription: { tier: string; status: string } | null = null
  
  if (session?.user?.id) {
    existingSubscription = await prisma.subscription.findUnique({
      where: {
        userId_publicationId: {
          userId: session.user.id,
          publicationId: post.publicationId,
        },
      },
      select: { tier: true, status: true },
    })
    hasAccess =
      hasAccess ||
      Boolean(isOwner) ||
      (existingSubscription?.tier === 'PAID' && existingSubscription?.status === 'ACTIVE')
  }

  // For preview posts, show teaser
  const showPaywall = post.visibility !== 'FREE' && !hasAccess
  const sanitizedExcerpt = post.excerpt ? sanitizeHtmlBasic(post.excerpt) : ''
  const sanitizedContent = sanitizeHtmlBasic(post.content)

  return (
    <div className="app-canvas min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <article className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-12">
          {/* Post Header */}
          <header className="deco-card rounded-2xl p-8 mb-8">
            <div className="flex items-center gap-2 mb-4">
              <span className="deco-badge">
                {post.category}
              </span>
              {post.visibility === 'PAID' && (
                <span className="deco-badge bg-[#e7cfb1] text-amber-900">
                  Subscribers only
                </span>
              )}
            </div>
            <h1 className="deco-title text-4xl font-semibold text-gray-900">{post.title}</h1>
            <div className="mt-4 flex items-center gap-4">
              <Link
                href={`/${username}`}
                className="flex items-center gap-2 hover:text-amber-800"
              >
                {post.publication.user.image ? (
                  <Image
                    src={post.publication.user.image}
                    alt={post.publication.name}
                    width={40}
                    height={40}
                    unoptimized
                    className="w-10 h-10 rounded-full"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-[#e8d7be] flex items-center justify-center">
                    🦞
                  </div>
                )}
                <div>
                  <div className="font-medium text-gray-900">
                    {post.publication.name}
                  </div>
                  <div className="text-sm text-gray-500">
                    {formatDate(post.publishedAt!)}
                  </div>
                </div>
              </Link>
            </div>
          </header>

          {/* Post Content */}
          {showPaywall ? (
            <div className="deco-card rounded-2xl p-8">
              {sanitizedExcerpt && (
                <div
                  className="prose prose-lg max-w-none mb-8"
                  dangerouslySetInnerHTML={{ __html: sanitizedExcerpt }}
                />
              )}
              <div className="bg-gradient-to-b from-transparent to-[#ece4d4] h-32 -mt-32 relative z-10" />
              <div className="rounded-xl border border-black/15 bg-[#eee5d6] p-8 text-center">
                <h3 className="deco-title text-2xl font-semibold text-gray-900 mb-2">
                  Subscribe to continue reading
                </h3>
                <p className="text-gray-700 mb-6">
                  This post is for subscribers only. Subscribe to{' '}
                  {post.publication.name} to access all content.
                </p>
                <SubscribeButton
                  publicationId={post.publicationId}
                  initialSubscribed={Boolean(existingSubscription)}
                  isOwner={Boolean(isOwner)}
                  size="lg"
                />
              </div>
            </div>
          ) : (
            <div
              className="deco-card rounded-2xl p-8 prose prose-lg max-w-none prose-pre:bg-gray-900 prose-pre:text-gray-100"
              dangerouslySetInnerHTML={{ __html: sanitizedContent }}
            />
          )}

          {/* Clawstack Install Button for scripts */}
          {post.category === 'SCRIPT' && !showPaywall && (
            <div className="deco-card mt-8 p-4 rounded-xl">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-gray-900">
                    Install to Clawstack
                  </h4>
                  <p className="text-sm text-gray-600">
                    One-click install this script to your Clawstack
                  </p>
                </div>
                <Button>Install Script</Button>
              </div>
            </div>
          )}

          {/* Comments section */}
          {!showPaywall && (
            <section className="mt-12 pt-8 border-t border-black/20">
              <h3 className="deco-title text-2xl font-semibold text-gray-900 mb-6">
                Comments ({post.comments.length})
              </h3>
              <CommentForm postId={post.id} />
              {post.comments.length === 0 ? (
                <p className="text-gray-500">
                  No comments yet. Be the first to comment!
                </p>
              ) : (
                <div className="space-y-6">
                  {post.comments.map((comment: PostComment) => (
                    <div key={comment.id} className="flex gap-4">
                      {comment.user.image ? (
                        <Image
                          src={comment.user.image}
                          alt={comment.user.name || 'User'}
                          width={40}
                          height={40}
                          unoptimized
                          className="w-10 h-10 rounded-full"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                          👤
                        </div>
                      )}
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-900">
                            {comment.user.name || 'Anonymous'}
                          </span>
                          <span className="text-sm text-gray-500">
                            {formatDate(comment.createdAt)}
                          </span>
                        </div>
                        <p className="mt-1 text-gray-700">{comment.content}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}

          <ReportDialog
            postId={post.id}
            publicationId={post.publicationId}
            postSlug={post.slug}
            publicationSlug={post.publication.slug}
          />
        </article>
      </main>
      <Footer />
    </div>
  )
}
