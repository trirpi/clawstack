'use client'

import { useState } from 'react'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { Notice } from '@/components/ui/Notice'
import { Button } from '@/components/ui/Button'

interface SendPostButtonProps {
  postId: string
  postTitle: string
}

export function SendPostButton({ postId, postTitle }: SendPostButtonProps) {
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [message, setMessage] = useState<{ tone: 'success' | 'error' | 'info'; text: string } | null>(null)

  const openConfirm = () => {
    setMessage(null)
    setConfirmOpen(true)
  }

  const handleSend = async () => {
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
      setMessage({ tone: 'success', text: data.message || 'Newsletter sent successfully.' })
    } catch (error) {
      console.error('Send error:', error)
      const message = error instanceof Error ? error.message : 'Failed to send newsletter'
      setMessage({ tone: 'error', text: message })
    } finally {
      setLoading(false)
      setConfirmOpen(false)
    }
  }

  if (sent) {
    return (
      <div className="flex flex-col items-end gap-2">
        <span className="px-4 py-2 text-sm font-medium text-green-600">Sent ✓</span>
        {message && <Notice tone={message.tone} message={message.text} />}
      </div>
    )
  }

  return (
    <>
      <div className="flex flex-col items-end gap-2">
        <Button onClick={openConfirm} disabled={loading} variant="outline" size="sm">
          {loading ? 'Sending...' : 'Send to Subscribers'}
        </Button>
        {message && <Notice tone={message.tone} message={message.text} />}
      </div>
      <ConfirmDialog
        open={confirmOpen}
        title="Send Post To Subscribers"
        description={`Send "${postTitle}" to all active subscribers now?`}
        confirmLabel="Send post"
        loading={loading}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={handleSend}
      />
    </>
  )
}
