import { redirect } from 'next/navigation'
import { getSession, getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Header } from '@/components/layout/Header'
import { DashboardNav } from '@/components/dashboard/DashboardNav'
import { NewsletterComposer } from './NewsletterComposer'
import { SendPostButton } from '@/components/dashboard/SendPostButton'

export const metadata = {
  title: 'Newsletter - Clawstack',
  description: 'Send newsletters to your subscribers',
}

export default async function NewsletterPage() {
  const session = await getSession()
  
  if (!session?.user) {
    redirect('/login')
  }

  const user = await getCurrentUser()
  
  if (!user?.publication) {
    redirect('/dashboard')
  }

  // Get subscriber count
  const subscriberCount = await prisma.subscription.count({
    where: { publicationId: user.publication.id },
  })

  // Get recent posts that could be sent as newsletters
  const recentPosts = await prisma.post.findMany({
    where: {
      publicationId: user.publication.id,
      published: true,
    },
    orderBy: { publishedAt: 'desc' },
    take: 5,
    select: {
      id: true,
      title: true,
      publishedAt: true,
    },
  })
  type RecentPost = (typeof recentPosts)[number]

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <DashboardNav />
      <main className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-8">Newsletter</h1>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="text-sm text-gray-500">Subscribers</div>
            <div className="text-3xl font-bold text-gray-900 mt-1">{subscriberCount}</div>
            <p className="text-sm text-gray-500 mt-2">
              Will receive your newsletter
            </p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="text-sm text-gray-500">Email Provider</div>
            <div className="text-xl font-semibold text-gray-900 mt-1">
              {process.env.RESEND_API_KEY ? 'Resend' : 'Not configured'}
            </div>
            <p className="text-sm text-gray-500 mt-2">
              {process.env.RESEND_API_KEY 
                ? 'Ready to send emails' 
                : 'Set RESEND_API_KEY to enable'}
            </p>
          </div>
        </div>

        {/* Compose Newsletter */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Send Newsletter</h2>
          <NewsletterComposer 
            subscriberCount={subscriberCount}
            publicationName={user.publication.name}
          />
        </div>

        {/* Send Post as Newsletter */}
        {recentPosts.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Or Send a Published Post
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              Send one of your recent posts directly to all subscribers.
            </p>
                <div className="space-y-3">
              {recentPosts.map((post: RecentPost) => (
                <div
                  key={post.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <div>
                    <div className="font-medium text-gray-900">{post.title}</div>
                    <div className="text-sm text-gray-500">
                      Published {post.publishedAt?.toLocaleDateString()}
                    </div>
                  </div>
                  <SendPostButton postId={post.id} postTitle={post.title} />
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
