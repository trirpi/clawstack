'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Notice } from '@/components/ui/Notice'

export function RunModerationScanButton() {
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ tone: 'success' | 'error' | 'info'; text: string } | null>(null)

  const handleScan = async () => {
    setLoading(true)
    setMessage(null)

    try {
      const response = await fetch('/api/admin/moderation/scan', {
        method: 'POST',
      })
      const body = await response.json().catch(() => null)

      if (!response.ok) {
        throw new Error(body?.error || 'Failed to run moderation scan')
      }

      setMessage({
        tone: 'success',
        text: `Scanned ${body.scanned} posts. Flagged ${body.flaggedPosts}, unpublished ${body.unpublishedPosts}, created ${body.createdReports} reports.`,
      })
    } catch (error) {
      setMessage({
        tone: 'error',
        text: error instanceof Error ? error.message : 'Failed to run moderation scan',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <Button onClick={handleScan} disabled={loading}>
        {loading ? 'Scanning...' : 'Run Automated Moderation Scan'}
      </Button>
      {message && <Notice tone={message.tone} message={message.text} />}
    </div>
  )
}
