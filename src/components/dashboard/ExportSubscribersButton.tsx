'use client'

import { useState } from 'react'

export function ExportSubscribersButton() {
  const [loading, setLoading] = useState(false)

  const handleExport = async () => {
    setLoading(true)
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
    } catch (error) {
      console.error('Export error:', error)
      const message = error instanceof Error ? error.message : 'Failed to export subscribers'
      alert(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleExport}
      disabled={loading}
      className="text-sm text-orange-600 hover:text-orange-700 font-medium disabled:opacity-50"
    >
      {loading ? 'Exporting...' : 'Export CSV'}
    </button>
  )
}
