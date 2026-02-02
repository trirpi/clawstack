import { redirect, notFound } from 'next/navigation'
import { getSession, getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Header } from '@/components/layout/Header'
import { PostEditor } from '@/components/editor/PostEditor'

interface Props {
  params: Promise<{ id: string }>
}

export default async function EditPostPage({ params }: Props) {
  const { id } = await params
  const session = await getSession()
  
  if (!session?.user) {
    redirect('/login')
  }

  const user = await getCurrentUser()
  
  if (!user?.publication) {
    redirect('/dashboard')
  }

  const post = await prisma.post.findUnique({
    where: { id },
    include: { publication: true },
  })

  if (!post || post.publication.userId !== session.user.id) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Edit Post</h1>
        <PostEditor
          publicationId={user.publication.id}
          initialData={{
            id: post.id,
            title: post.title,
            content: post.content,
            excerpt: post.excerpt || '',
            category: post.category,
            visibility: post.visibility,
            published: post.published,
          }}
        />
      </main>
    </div>
  )
}
