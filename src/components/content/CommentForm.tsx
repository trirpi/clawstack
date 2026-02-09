'use client'

import { useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/Button'
import { Notice } from '@/components/ui/Notice'

interface CommentFormProps {
  postId: string
}

export function CommentForm({ postId }: CommentFormProps) {
  const { data: session } = useSession()
  const router = useRouter()
  const [content, setContent] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState<{ tone: 'success' | 'error' | 'info'; text: string } | null>(null)

  if (!session) {
    return (
      <div className="bg-gray-50 rounded-lg p-4 text-center">
        <p className="text-gray-600 mb-2">Sign in to leave a comment</p>
        <Button onClick={() => router.push('/login')} variant="outline" size="sm">
          Sign In
        </Button>
      </div>
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim()) return

    setSubmitting(true)
    setMessage(null)
    try {
      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId, content }),
      })

      if (!response.ok) throw new Error('Failed to post comment')

      setContent('')
      setMessage({ tone: 'success', text: 'Comment posted.' })
      router.refresh()
    } catch (error) {
      console.error('Error posting comment:', error)
      setMessage({ tone: 'error', text: 'Failed to post comment.' })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mb-6">
      <div className="flex gap-4">
        {session.user?.image ? (
          <Image
            src={session.user.image}
            alt={session.user.name || 'You'}
            width={40}
            height={40}
            unoptimized
            className="w-10 h-10 rounded-full"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
            🦞
          </div>
        )}
        <div className="flex-1">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write a comment..."
            rows={3}
            className="w-full rounded-lg border-gray-300 focus:border-orange-500 focus:ring-orange-500 resize-none"
          />
          <div className="mt-2 flex justify-end">
            <Button type="submit" disabled={submitting || !content.trim()}>
              {submitting ? 'Posting...' : 'Post Comment'}
            </Button>
          </div>
          {message && <div className="mt-2"><Notice tone={message.tone} message={message.text} /></div>}
        </div>
      </div>
    </form>
  )
}
