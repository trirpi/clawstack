'use client'

import { useState } from 'react'

interface SendPostButtonProps {
  postId: string
  postTitle: string
}

export function SendPostButton({ postId, postTitle }: SendPostButtonProps) {
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const handleSend = async () => {
    if (!confirm(`Send "${postTitle}" to all your subscribers?`)) {
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/newsletter/send-post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId }),
      })
      
      const data = await res.json()
      
      if (!res.ok) {
        throw new Error(data.error || 'Failed to send')
      }
      
      setSent(true)
      alert(data.message)
    } catch (error) {
      console.error('Send error:', error)
      const message = error instanceof Error ? error.message : 'Failed to send newsletter'
      alert(message)
    } finally {
      setLoading(false)
    }
  }

  if (sent) {
    return (
      <span className="px-4 py-2 text-sm font-medium text-green-600">
        Sent ✓
      </span>
    )
  }

  return (
    <button
      onClick={handleSend}
      disabled={loading}
      className="px-4 py-2 text-sm font-medium text-orange-600 hover:text-orange-700 hover:bg-orange-50 rounded-lg transition-colors disabled:opacity-50"
    >
      {loading ? 'Sending...' : 'Send to Subscribers'}
    </button>
  )
}
