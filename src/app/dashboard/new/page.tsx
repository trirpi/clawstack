import { redirect } from 'next/navigation'
import { getSession, getCurrentUser } from '@/lib/auth'
import { Header } from '@/components/layout/Header'
import { PostEditor } from '@/components/editor/PostEditor'
import { getPostTemplate } from '@/lib/postTemplates'
import { buildLoginHref } from '@/lib/routes'

interface Props {
  searchParams: Promise<{ template?: string }>
}

export default async function NewPostPage({ searchParams }: Props) {
  const { template } = await searchParams
  const selectedTemplate = getPostTemplate(template)
  const session = await getSession()
  
  if (!session?.user) {
    const callbackUrl = template ? `/dashboard/new?template=${template}` : '/dashboard/new'
    redirect(buildLoginHref(callbackUrl))
  }

  const user = await getCurrentUser()
  
  if (!user?.publication) {
    redirect('/dashboard')
  }

  return (
    <div className="app-canvas min-h-screen">
      <Header />
      <main className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="app-heading text-3xl mb-6">New Post</h1>
        <PostEditor publicationId={user.publication.id} templateData={selectedTemplate ?? undefined} />
      </main>
    </div>
  )
}
