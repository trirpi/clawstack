import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getSession, getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Header } from '@/components/layout/Header'
import { DashboardNav } from '@/components/dashboard/DashboardNav'
import { Button } from '@/components/ui/Button'
import { formatDate, slugify } from '@/lib/utils'

export const metadata = {
  title: 'Dashboard - Clawstack',
  description: 'Manage your posts and publication',
}

export default async function DashboardPage() {
  const session = await getSession()
  
  if (!session?.user) {
    redirect('/login')
  }

  const user = await getCurrentUser()
  
  // Get or create publication
  let publication = user?.publication
  
  if (!publication) {
    // Create a default publication for new users
    const baseSlugSource = session.user.email?.split('@')[0] || session.user.name || session.user.id
    const baseSlug = slugify(baseSlugSource) || session.user.id
    let slug = baseSlug
    let suffix = 1

    while (await prisma.publication.findUnique({ where: { slug } })) {
      suffix += 1
      slug = `${baseSlug}-${suffix}`
    }

    publication = await prisma.publication.create({
      data: {
        name: `${session.user.name || 'My'}'s Publication`,
        slug,
        userId: session.user.id,
      },
    })
  }

  // Get posts
  const posts = await prisma.post.findMany({
    where: { publicationId: publication.id },
    orderBy: { createdAt: 'desc' },
    take: 10,
  })

  // Get subscriber count
  const subscriberCount = await prisma.subscription.count({
    where: { publicationId: publication.id },
  })
  type DashboardPost = (typeof posts)[number]

  return (
    <div className="app-canvas min-h-screen">
      <Header />
      <DashboardNav />
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3 mb-8">
          <div className="app-panel p-6">
            <div className="text-sm text-gray-700">Total Posts</div>
            <div className="text-3xl font-bold text-gray-900 mt-1">{posts.length}</div>
          </div>
          <div className="app-panel p-6">
            <div className="text-sm text-gray-700">Subscribers</div>
            <div className="text-3xl font-bold text-gray-900 mt-1">{subscriberCount}</div>
          </div>
          <div className="app-panel p-6">
            <div className="text-sm text-gray-700">Publication</div>
            <div className="text-xl font-semibold text-gray-900 mt-1 truncate">
              {publication.name}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="app-heading text-3xl">Your Posts</h1>
          <Link href="/dashboard/new">
            <Button>New Post</Button>
          </Link>
        </div>

        {/* Posts List */}
        {posts.length === 0 ? (
          <div className="app-panel p-12 text-center">
            <div className="text-4xl mb-4">📝</div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              No posts yet
            </h2>
            <p className="text-gray-600 mb-6">
              Start sharing your Clawstack scripts, plugins, and tutorials
            </p>
            <Link href="/dashboard/new">
              <Button>Create Your First Post</Button>
            </Link>
          </div>
        ) : (
          <div className="app-panel divide-y divide-black/10">
            {posts.map((post: DashboardPost) => (
              <div key={post.id} className="p-6 hover:bg-black/5 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/dashboard/edit/${post.id}`}
                      className="deco-title text-2xl font-semibold text-gray-900 hover:text-amber-800"
                    >
                      {post.title}
                    </Link>
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        post.published
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {post.published ? 'Published' : 'Draft'}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        {post.category}
                      </span>
                      <span>{formatDate(post.createdAt)}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <Link href={`/dashboard/edit/${post.id}`}>
                      <Button variant="ghost" size="sm">
                        Edit
                      </Button>
                    </Link>
                    <Link href={`/${publication.slug}/${post.slug}`}>
                      <Button variant="outline" size="sm">
                        View
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
