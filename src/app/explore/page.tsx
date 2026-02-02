import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { formatDate } from '@/lib/utils'

export const metadata = {
  title: 'Explore - Clawstack',
  description: 'Discover scripts, plugins, prompts, and tutorials from the Clawstack community.',
}

// Make this page dynamic (not pre-rendered at build time)
export const dynamic = 'force-dynamic'

export default async function ExplorePage() {
  // Get recent published posts
  const posts = await prisma.post.findMany({
    where: { published: true },
    orderBy: { publishedAt: 'desc' },
    take: 20,
    include: {
      publication: {
        include: { user: true },
      },
    },
  })

  // Get popular publications
  const publications = await prisma.publication.findMany({
    take: 6,
    include: {
      user: true,
      _count: {
        select: { subscribers: true, posts: true },
      },
    },
    orderBy: {
      subscribers: { _count: 'desc' },
    },
  })

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        {/* Hero */}
        <div className="bg-gradient-to-b from-orange-50 to-white py-12">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h1 className="text-4xl font-bold text-gray-900">Explore</h1>
            <p className="mt-2 text-lg text-gray-600">
              Discover scripts, plugins, prompts, and tutorials from the community
            </p>
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
          {/* Featured Publications */}
          {publications.length > 0 && (
            <section className="mb-16">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Featured Creators
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {publications.map((pub) => (
                  <Link
                    key={pub.id}
                    href={`/${pub.slug}`}
                    className="block p-6 bg-white rounded-xl border border-gray-200 hover:border-orange-200 hover:shadow-lg transition-all"
                  >
                    <div className="flex items-center gap-4">
                      {pub.user.image ? (
                        <img
                          src={pub.user.image}
                          alt={pub.name}
                          className="w-12 h-12 rounded-full"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center text-2xl">
                          🦞
                        </div>
                      )}
                      <div>
                        <h3 className="font-semibold text-gray-900">{pub.name}</h3>
                        <p className="text-sm text-gray-500">
                          {pub._count.subscribers} subscribers · {pub._count.posts} posts
                        </p>
                      </div>
                    </div>
                    {pub.description && (
                      <p className="mt-4 text-gray-600 text-sm line-clamp-2">
                        {pub.description}
                      </p>
                    )}
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Recent Posts */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Recent Posts
            </h2>
            {posts.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-xl">
                <p className="text-gray-500">No posts yet. Be the first to publish!</p>
                <Link
                  href="/login"
                  className="inline-block mt-4 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
                >
                  Start Publishing
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {posts.map((post) => (
                  <article key={post.id} className="group">
                    <Link href={`/${post.publication.slug}/${post.slug}`}>
                      <div className="flex items-start gap-2 mb-2">
                        <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-700">
                          {post.category}
                        </span>
                        {post.visibility === 'PAID' && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-orange-100 text-orange-700">
                            Subscribers only
                          </span>
                        )}
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 group-hover:text-orange-600 transition-colors">
                        {post.title}
                      </h3>
                      {post.excerpt && (
                        <p className="mt-2 text-gray-600 line-clamp-2">
                          {post.excerpt}
                        </p>
                      )}
                      <div className="mt-3 flex items-center gap-3 text-sm text-gray-500">
                        <span>{post.publication.name}</span>
                        <span>·</span>
                        <span>{formatDate(post.publishedAt!)}</span>
                      </div>
                    </Link>
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>
      <Footer />
    </div>
  )
}
