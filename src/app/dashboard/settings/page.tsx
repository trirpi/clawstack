import { redirect } from 'next/navigation'
import { getSession, getCurrentUser } from '@/lib/auth'
import { Header } from '@/components/layout/Header'
import { DashboardNav } from '@/components/dashboard/DashboardNav'
import { SettingsForm } from './SettingsForm'

export const metadata = {
  title: 'Settings - Clawstack',
  description: 'Manage your publication settings',
}

export default async function SettingsPage() {
  const session = await getSession()
  
  if (!session?.user) {
    redirect('/login')
  }

  const user = await getCurrentUser()
  
  if (!user?.publication) {
    redirect('/dashboard')
  }

  return (
    <div className="app-canvas min-h-screen">
      <Header />
      <DashboardNav />
      <main className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="app-heading text-3xl mb-8">Settings</h1>
        
        <SettingsForm 
          publication={user.publication}
          user={{
            id: user.id,
            name: user.name,
            email: user.email,
            bio: user.bio,
            image: user.image,
          }}
        />
      </main>
    </div>
  )
}
