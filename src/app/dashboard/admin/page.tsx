import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { Header } from '@/components/layout/Header'
import { DashboardNav } from '@/components/dashboard/DashboardNav'
import { SeedDemoButton } from './SeedDemoButton'

export const metadata = {
  title: 'Admin - Clawstack',
  description: 'Platform administration tools',
}

export default async function AdminDashboardPage() {
  const session = await getSession()

  if (!session?.user?.id) {
    redirect('/login')
  }
  if (session.user.isPlatformAdmin !== true) {
    redirect('/dashboard')
  }

  return (
    <div className="app-canvas min-h-screen">
      <Header />
      <DashboardNav />
      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <h1 className="app-heading text-3xl">Admin Tools</h1>
        <p className="mt-2 text-gray-700">
          Create demo users and content to verify subscriptions, moderation, and email flows.
        </p>

        <section className="app-panel mt-6 space-y-4 p-6">
          <h2 className="app-heading text-2xl">Demo Environment</h2>
          <p className="text-sm text-gray-700">
            Generates a demo publication with free + paid posts and subscribes your admin user so you can test
            reader and creator workflows end-to-end.
          </p>
          <SeedDemoButton />
        </section>

        <section className="app-panel mt-6 space-y-3 p-6">
          <h2 className="app-heading text-2xl">Quick links</h2>
          <div className="flex flex-wrap gap-3 text-sm">
            <Link href="/dashboard/reports" className="text-amber-800 hover:text-amber-900">
              Reports queue
            </Link>
            <Link href="/explore" className="text-amber-800 hover:text-amber-900">
              Explore templates
            </Link>
          </div>
        </section>
      </main>
    </div>
  )
}
