'use client'

import { useState } from 'react'
import { Notice } from '@/components/ui/Notice'

export function ExportSubscribersButton() {
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ tone: 'success' | 'error' | 'info'; text: string } | null>(null)

  const handleExport = async () => {
    setLoading(true)
    setMessage(null)
    try {
      const res = await fetch('/api/subscribers/export')
      
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to export')
      }
      
      // Get the blob and download it
      const blob = await res.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `subscribers-${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      setMessage({ tone: 'success', text: 'Subscriber CSV downloaded.' })
    } catch (error) {
      console.error('Export error:', error)
      const message = error instanceof Error ? error.message : 'Failed to export subscribers'
      setMessage({ tone: 'error', text: message })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <button
        onClick={handleExport}
        disabled={loading}
        className="text-sm text-orange-600 hover:text-orange-700 font-medium disabled:opacity-50"
      >
        {loading ? 'Exporting...' : 'Export CSV'}
      </button>
      {message && <Notice tone={message.tone} message={message.text} />}
    </div>
  )
}
