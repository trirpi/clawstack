import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getSession, getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Header } from '@/components/layout/Header'
import { DashboardNav } from '@/components/dashboard/DashboardNav'
import { Button } from '@/components/ui/Button'
import { StripeConnectButton } from './StripeConnectButton'

export const metadata = {
  title: 'Earnings - Clawstack',
  description: 'Manage your earnings and payouts',
}

export default async function EarningsPage() {
  const session = await getSession()
  
  if (!session?.user) {
    redirect('/login')
  }

  const user = await getCurrentUser()
  
  if (!user?.publication) {
    redirect('/dashboard')
  }

  // Get paid subscribers
  const paidSubscribers = await prisma.subscription.count({
    where: {
      publicationId: user.publication.id,
      tier: 'PAID',
      status: 'ACTIVE',
    },
  })

  // Calculate potential earnings (this would come from Stripe in production)
  const monthlyPrice = user.publication.priceMonthly || 0
  const monthlyRevenue = paidSubscribers * monthlyPrice
  const platformFee = Math.round(monthlyRevenue * 0.1) // 10% platform fee
  const creatorEarnings = monthlyRevenue - platformFee

  const hasStripeAccount = !!user.stripeAccountId

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <DashboardNav />
      <main className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-8">Earnings</h1>

        {/* Stripe Connect Setup */}
        {!hasStripeAccount && (
          <div className="bg-orange-50 border border-orange-200 rounded-xl p-6 mb-8">
            <h2 className="text-lg font-semibold text-orange-900 mb-2">
              Set Up Payouts
            </h2>
            <p className="text-orange-800 mb-4">
              Connect your Stripe account to receive payments from subscribers.
              You&apos;ll keep 90% of all subscription revenue.
            </p>
            <StripeConnectButton />
          </div>
        )}

        {/* Earnings Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="text-sm text-gray-500">Paid Subscribers</div>
            <div className="text-3xl font-bold text-gray-900 mt-1">{paidSubscribers}</div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="text-sm text-gray-500">Monthly Revenue</div>
            <div className="text-3xl font-bold text-gray-900 mt-1">
              ${(monthlyRevenue / 100).toFixed(2)}
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="text-sm text-gray-500">Your Earnings (90%)</div>
            <div className="text-3xl font-bold text-green-600 mt-1">
              ${(creatorEarnings / 100).toFixed(2)}
            </div>
          </div>
        </div>

        {/* Pricing Info */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Your Pricing</h2>
          
          {user.publication.priceMonthly || user.publication.priceYearly ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-500">Monthly</div>
                <div className="text-2xl font-bold text-gray-900">
                  {user.publication.priceMonthly 
                    ? `$${(user.publication.priceMonthly / 100).toFixed(2)}/mo`
                    : 'Not set'}
                </div>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-500">Yearly</div>
                <div className="text-2xl font-bold text-gray-900">
                  {user.publication.priceYearly 
                    ? `$${(user.publication.priceYearly / 100).toFixed(2)}/yr`
                    : 'Not set'}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-6">
              <p className="text-gray-600 mb-4">
                You haven&apos;t set up paid subscriptions yet.
              </p>
              <Link href="/dashboard/settings">
                <Button variant="outline">Set Pricing</Button>
              </Link>
            </div>
          )}
        </div>

        {/* Stripe Account Status */}
        {hasStripeAccount && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Payout Account</h2>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <div className="font-medium text-gray-900">Stripe Connected</div>
                  <div className="text-sm text-gray-500">Payouts are enabled</div>
                </div>
              </div>
              <StripeConnectButton isConnected />
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
