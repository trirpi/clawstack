import Image from 'next/image'
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

const boilerplatePosts = [
  {
    category: 'SCRIPT',
    title: 'Weekly Pipeline Health Check (Boilerplate)',
    excerpt:
      'A ready-to-publish issue template for checking failed automations, flaky tests, and on-call notes.',
    publicationName: 'Clawstack Editorial',
  },
  {
    category: 'TUTORIAL',
    title: 'Prompt Versioning Workflow (Boilerplate)',
    excerpt:
      'A practical structure for publishing prompt changelogs with rollout notes and fallback guidance.',
    publicationName: 'Clawstack Editorial',
  },
  {
    category: 'PLUGIN',
    title: 'Incident Digest Generator (Boilerplate)',
    excerpt:
      'A starter template for a daily incident digest post with severity tags and remediation checklist.',
    publicationName: 'Clawstack Editorial',
  },
] as const

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
  type ExplorePublication = (typeof publications)[number]
  type ExplorePost = (typeof posts)[number]

  const hasPosts = posts.length > 0

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        {/* Hero */}
        <div className="py-12">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="deco-kicker mb-2">Discover</div>
            <h1 className="deco-title text-4xl font-semibold text-gray-900">Explore</h1>
            <p className="mt-2 text-lg text-gray-700">
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
                {publications.map((pub: ExplorePublication) => (
                  <Link
                    key={pub.id}
                    href={`/${pub.slug}`}
                    className="deco-card block p-6 rounded-xl hover:-translate-y-0.5 transition-all"
                  >
                    <div className="flex items-center gap-4">
                      {pub.user.image ? (
                        <Image
                          src={pub.user.image}
                          alt={pub.name}
                          width={48}
                          height={48}
                          unoptimized
                          className="w-12 h-12 rounded-full"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center text-2xl">
                          🦞
                        </div>
                      )}
                      <div>
                        <h3 className="font-semibold text-gray-900">{pub.name}</h3>
                        <p className="text-sm text-gray-600">
                          {pub._count.subscribers} subscribers · {pub._count.posts} posts
                        </p>
                      </div>
                    </div>
                    {pub.description && (
                      <p className="mt-4 text-gray-700 text-sm line-clamp-2">
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
            {hasPosts ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {posts.map((post: ExplorePost) => (
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
                        <p className="mt-2 text-gray-700 line-clamp-2">
                          {post.excerpt}
                        </p>
                      )}
                      <div className="mt-3 flex items-center gap-3 text-sm text-gray-600">
                        <span>{post.publication.name}</span>
                        <span>·</span>
                        <span>{formatDate(post.publishedAt!)}</span>
                      </div>
                    </Link>
                  </article>
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-gray-300 bg-white p-8 text-center">
                <p className="text-gray-700">No published posts yet.</p>
              </div>
            )}
          </section>

          <section className="mt-14">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Starter Templates</h2>
            <p className="text-sm text-gray-700 mb-6">
              Prebuilt post ideas you can adapt and publish quickly.
            </p>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {boilerplatePosts.map((post, index) => (
                <article
                  key={`${post.title}-${index}`}
                  className="deco-card rounded-xl p-6 border-dashed border-amber-800/30"
                >
                  <div className="flex items-start gap-2 mb-2">
                    <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-700">
                      {post.category}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                      Boilerplate
                    </span>
                  </div>
                  <h3 className="deco-title text-xl font-semibold text-gray-900">
                    {post.title}
                  </h3>
                  <p className="mt-2 text-gray-700">{post.excerpt}</p>
                  <div className="mt-3 flex items-center justify-between text-sm text-gray-600">
                    <span>{post.publicationName}</span>
                    <Link href="/login" className="text-amber-700 hover:text-amber-800 font-medium">
                      Use template
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  )
}
