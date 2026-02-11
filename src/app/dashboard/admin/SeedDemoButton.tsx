'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Notice } from '@/components/ui/Notice'

export function SeedDemoButton() {
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ tone: 'success' | 'error' | 'info'; text: string } | null>(null)

  const handleSeed = async () => {
    setLoading(true)
    setMessage(null)

    try {
      const response = await fetch('/api/admin/seed-demo', {
        method: 'POST',
      })
      const body = await response.json().catch(() => null)

      if (!response.ok) {
        throw new Error(body?.error || 'Failed to create demo content')
      }

      setMessage({
        tone: 'success',
        text: `${body.message} Demo publication: /${body.publicationSlug}`,
      })
    } catch (error) {
      setMessage({
        tone: 'error',
        text: error instanceof Error ? error.message : 'Failed to create demo content',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <Button onClick={handleSeed} disabled={loading}>
        {loading ? 'Preparing...' : 'Create Demo Publisher + Posts'}
      </Button>
      {message && <Notice tone={message.tone} message={message.text} />}
    </div>
  )
}
