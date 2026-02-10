import Image from 'next/image'
import { redirect } from 'next/navigation'
import { getSession, getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Header } from '@/components/layout/Header'
import { DashboardNav } from '@/components/dashboard/DashboardNav'
import { ExportSubscribersButton } from '@/components/dashboard/ExportSubscribersButton'
import { formatDate } from '@/lib/utils'

export const metadata = {
  title: 'Subscribers - Clawstack',
  description: 'Manage your subscribers',
}

export default async function SubscribersPage() {
  const session = await getSession()
  
  if (!session?.user) {
    redirect('/login')
  }

  const user = await getCurrentUser()
  
  if (!user?.publication) {
    redirect('/dashboard')
  }

  // Get all subscribers with user details
  const subscribers = await prisma.subscription.findMany({
    where: { publicationId: user.publication.id },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  })
  type Subscriber = (typeof subscribers)[number]

  const freeSubscribers = subscribers.filter((s: Subscriber) => s.tier === 'FREE')
  const paidSubscribers = subscribers.filter((s: Subscriber) => s.tier === 'PAID')

  return (
    <div className="app-canvas min-h-screen">
      <Header />
      <DashboardNav />
      <main className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="app-heading text-3xl">Subscribers</h1>
          {subscribers.length > 0 && <ExportSubscribersButton />}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
          <div className="app-panel p-6">
            <div className="text-sm text-gray-500">Total Subscribers</div>
            <div className="text-3xl font-bold text-gray-900 mt-1">{subscribers.length}</div>
          </div>
          <div className="app-panel p-6">
            <div className="text-sm text-gray-500">Free</div>
            <div className="text-3xl font-bold text-gray-900 mt-1">{freeSubscribers.length}</div>
          </div>
          <div className="app-panel p-6">
            <div className="text-sm text-gray-500">Paid</div>
            <div className="text-3xl font-bold text-green-600 mt-1">{paidSubscribers.length}</div>
          </div>
        </div>

        {/* Subscriber List */}
        {subscribers.length === 0 ? (
          <div className="app-panel p-12 text-center">
            <div className="text-4xl mb-4">👥</div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              No subscribers yet
            </h2>
            <p className="text-gray-600">
              Share your publication to start building your audience
            </p>
          </div>
        ) : (
          <div className="app-panel">
            <div className="px-6 py-4 border-b border-black/10">
              <div className="grid grid-cols-12 gap-4 text-sm font-medium text-gray-500">
                <div className="col-span-5">Subscriber</div>
                <div className="col-span-2">Tier</div>
                <div className="col-span-2">Status</div>
                <div className="col-span-3">Joined</div>
              </div>
            </div>
            <div className="divide-y divide-black/10">
              {subscribers.map((subscription: Subscriber) => (
                <div key={subscription.id} className="px-6 py-4 hover:bg-black/5">
                  <div className="grid grid-cols-12 gap-4 items-center">
                    <div className="col-span-5 flex items-center gap-3">
                      {subscription.user.image ? (
                        <Image
                          src={subscription.user.image}
                          alt=""
                          width={32}
                          height={32}
                          unoptimized
                          className="w-8 h-8 rounded-full"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-[#e8d7be] flex items-center justify-center text-sm">
                          {subscription.user.name?.[0] || subscription.user.email[0]}
                        </div>
                      )}
                      <div className="min-w-0">
                        <div className="font-medium text-gray-900 truncate">
                          {subscription.user.name || 'Anonymous'}
                        </div>
                        <div className="text-sm text-gray-500 truncate">
                          {subscription.user.email}
                        </div>
                      </div>
                    </div>
                    <div className="col-span-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        subscription.tier === 'PAID'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {subscription.tier}
                      </span>
                    </div>
                    <div className="col-span-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        subscription.status === 'ACTIVE'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {subscription.status}
                      </span>
                    </div>
                    <div className="col-span-3 text-sm text-gray-500">
                      {formatDate(subscription.createdAt)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
