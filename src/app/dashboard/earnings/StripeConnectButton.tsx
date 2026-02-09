'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Notice } from '@/components/ui/Notice'

interface StripeConnectButtonProps {
  isConnected?: boolean
}

export function StripeConnectButton({ isConnected = false }: StripeConnectButtonProps) {
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ tone: 'success' | 'error' | 'info'; text: string } | null>(null)

  const handleConnect = async () => {
    setLoading(true)
    setMessage(null)
    try {
      const res = await fetch('/api/stripe/connect', {
        method: 'POST',
      })
      
      const data = await res.json()
      
      if (!res.ok) {
        throw new Error(data.error || 'Failed to create connect account')
      }
      
      window.location.href = data.url
    } catch (error) {
      console.error('Stripe connect error:', error)
      const message = error instanceof Error ? error.message : 'Failed to connect Stripe. Please try again.'
      setMessage({ tone: 'error', text: message })
    } finally {
      setLoading(false)
    }
  }

  const handleDashboard = async () => {
    setLoading(true)
    setMessage(null)
    try {
      const res = await fetch('/api/stripe/dashboard', {
        method: 'POST',
      })
      
      if (!res.ok) throw new Error('Failed to open dashboard')
      
      const { url } = await res.json()
      window.open(url, '_blank')
    } catch (error) {
      console.error('Stripe dashboard error:', error)
      setMessage({ tone: 'error', text: 'Failed to open Stripe dashboard. Please try again.' })
    } finally {
      setLoading(false)
    }
  }

  if (isConnected) {
    return (
      <div className="flex flex-col items-start gap-2">
        <Button variant="outline" onClick={handleDashboard} disabled={loading}>
          {loading ? 'Loading...' : 'Open Stripe Dashboard'}
        </Button>
        {message && <Notice tone={message.tone} message={message.text} />}
      </div>
    )
  }

  return (
    <div className="flex flex-col items-start gap-2">
      <Button onClick={handleConnect} disabled={loading}>
        {loading ? 'Connecting...' : 'Connect Stripe Account'}
      </Button>
      {message && <Notice tone={message.tone} message={message.text} />}
    </div>
  )
}
