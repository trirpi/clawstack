import Image from 'next/image'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { SubscribeButton } from '@/components/content/SubscribeButton'
import { formatDate } from '@/lib/utils'

interface Props {
  params: Promise<{ username: string }>
}

export default async function PublicationPage({ params }: Props) {
  const { username } = await params
  const session = await getSession()

  const publication = await prisma.publication.findUnique({
    where: { slug: username },
    include: {
      user: true,
      posts: {
        where: { published: true },
        orderBy: { publishedAt: 'desc' },
      },
      _count: {
        select: { subscribers: true },
      },
    },
  })

  if (!publication) {
    notFound()
  }
  type PublicationPost = (typeof publication.posts)[number]
  const isOwner = session?.user?.id === publication.userId
  const existingSubscription = session?.user?.id
    ? await prisma.subscription.findUnique({
        where: {
          userId_publicationId: {
            userId: session.user.id,
            publicationId: publication.id,
          },
        },
      })
    : null

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        {/* Publication Header */}
        <div className="bg-gradient-to-b from-orange-50 to-white py-12">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 text-center">
            {publication.avatar ? (
              <Image
                src={publication.avatar}
                alt={publication.name}
                width={96}
                height={96}
                unoptimized
                className="w-24 h-24 rounded-full mx-auto mb-4 object-cover"
              />
            ) : (
              <div className="w-24 h-24 rounded-full mx-auto mb-4 bg-orange-100 flex items-center justify-center text-4xl">
                🦞
              </div>
            )}
            <h1 className="text-3xl font-bold text-gray-900">
              {publication.name}
            </h1>
            {publication.description && (
              <p className="mt-2 text-lg text-gray-600">
                {publication.description}
              </p>
            )}
            <div className="mt-4 flex items-center justify-center gap-4 text-sm text-gray-500">
              <span>{publication._count.subscribers} subscribers</span>
              <span>{publication.posts.length} posts</span>
            </div>
            <div className="mt-6">
              <SubscribeButton
                publicationId={publication.id}
                initialSubscribed={Boolean(existingSubscription)}
                isOwner={Boolean(isOwner)}
                size="lg"
              />
            </div>
          </div>
        </div>

        {/* Posts */}
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-12">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Latest Posts</h2>
          {publication.posts.length === 0 ? (
            <p className="text-gray-500 text-center py-12">
              No posts published yet.
            </p>
          ) : (
            <div className="space-y-8">
              {publication.posts.map((post: PublicationPost) => (
                <article key={post.id} className="group">
                  <Link href={`/${username}/${post.slug}`}>
                    <div className="flex items-start gap-2">
                      <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-700">
                        {post.category}
                      </span>
                      {post.visibility === 'PAID' && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-orange-100 text-orange-700">
                          Subscribers only
                        </span>
                      )}
                    </div>
                    <h3 className="mt-2 text-xl font-semibold text-gray-900 group-hover:text-orange-600 transition-colors">
                      {post.title}
                    </h3>
                    {post.excerpt && (
                      <p className="mt-2 text-gray-600 line-clamp-2">
                        {post.excerpt}
                      </p>
                    )}
                    <div className="mt-3 text-sm text-gray-500">
                      {formatDate(post.publishedAt!)}
                    </div>
                  </Link>
                </article>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}
