'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'

interface StripeConnectButtonProps {
  isConnected?: boolean
}

export function StripeConnectButton({ isConnected = false }: StripeConnectButtonProps) {
  const [loading, setLoading] = useState(false)

  const handleConnect = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/stripe/connect', {
        method: 'POST',
      })
      
      if (!res.ok) throw new Error('Failed to create connect account')
      
      const { url } = await res.json()
      window.location.href = url
    } catch (error) {
      console.error('Stripe connect error:', error)
      alert('Failed to connect Stripe. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleDashboard = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/stripe/dashboard', {
        method: 'POST',
      })
      
      if (!res.ok) throw new Error('Failed to open dashboard')
      
      const { url } = await res.json()
      window.open(url, '_blank')
    } catch (error) {
      console.error('Stripe dashboard error:', error)
      alert('Failed to open Stripe dashboard. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (isConnected) {
    return (
      <Button variant="outline" onClick={handleDashboard} disabled={loading}>
        {loading ? 'Loading...' : 'Open Stripe Dashboard'}
      </Button>
    )
  }

  return (
    <Button onClick={handleConnect} disabled={loading}>
      {loading ? 'Connecting...' : 'Connect Stripe Account'}
    </Button>
  )
}
