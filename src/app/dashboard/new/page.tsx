import { redirect } from 'next/navigation'
import { getSession, getCurrentUser } from '@/lib/auth'
import { Header } from '@/components/layout/Header'
import { PostEditor } from '@/components/editor/PostEditor'

export default async function NewPostPage() {
  const session = await getSession()
  
  if (!session?.user) {
    redirect('/login')
  }

  const user = await getCurrentUser()
  
  if (!user?.publication) {
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">New Post</h1>
        <PostEditor publicationId={user.publication.id} />
      </main>
    </div>
  )
}
