'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'

interface NewsletterComposerProps {
  subscriberCount: number
  publicationName: string
}

export function NewsletterComposer({ subscriberCount, publicationName }: NewsletterComposerProps) {
  const [subject, setSubject] = useState('')
  const [content, setContent] = useState('')
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)

  const handleSend = async () => {
    if (!subject.trim() || !content.trim()) {
      alert('Please fill in both subject and content')
      return
    }

    if (subscriberCount === 0) {
      alert('You have no subscribers yet')
      return
    }

    const confirmed = confirm(
      `Send this newsletter to ${subscriberCount} subscriber${subscriberCount === 1 ? '' : 's'}?`
    )
    
    if (!confirmed) return

    setSending(true)
    try {
      const res = await fetch('/api/newsletter/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject, content }),
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.message || 'Failed to send newsletter')
      }

      setSent(true)
      setSubject('')
      setContent('')
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to send newsletter')
    } finally {
      setSending(false)
    }
  }

  if (sent) {
    return (
      <div className="text-center py-8">
        <div className="text-4xl mb-4">✉️</div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Newsletter Sent!
        </h3>
        <p className="text-gray-600 mb-4">
          Your newsletter has been sent to {subscriberCount} subscriber{subscriberCount === 1 ? '' : 's'}.
        </p>
        <Button variant="outline" onClick={() => setSent(false)}>
          Send Another
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Subject
        </label>
        <input
          type="text"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder={`${publicationName} Newsletter`}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Content
        </label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={8}
          placeholder="Write your newsletter content here..."
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 font-mono text-sm"
        />
        <p className="text-xs text-gray-500 mt-1">
          Supports basic formatting. HTML will be rendered.
        </p>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
        <span className="text-sm text-gray-500">
          Will be sent to {subscriberCount} subscriber{subscriberCount === 1 ? '' : 's'}
        </span>
        <Button onClick={handleSend} disabled={sending || subscriberCount === 0}>
          {sending ? 'Sending...' : 'Send Newsletter'}
        </Button>
      </div>
    </div>
  )
}
