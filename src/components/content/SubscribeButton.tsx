'use client'

import { useMemo, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/Button'
import { buildLoginHref } from '@/lib/routes'

interface SubscribeButtonProps {
  publicationId: string
  initialSubscribed: boolean
  isOwner: boolean
  size?: 'sm' | 'md' | 'lg'
}

export function SubscribeButton({
  publicationId,
  initialSubscribed,
  isOwner,
  size = 'lg',
}: SubscribeButtonProps) {
  const router = useRouter()
  const pathname = usePathname()
  const { status } = useSession()

  const [subscribed, setSubscribed] = useState(initialSubscribed)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  const buttonSize = useMemo(() => {
    if (size === 'sm') return 'sm'
    if (size === 'md') return 'md'
    return 'lg'
  }, [size])

  const handleToggle = async () => {
    if (status !== 'authenticated') {
      router.push(buildLoginHref(pathname || '/'))
      return
    }

    setLoading(true)
    setMessage(null)
    try {
      const method = subscribed ? 'DELETE' : 'POST'
      const response = await fetch(`/api/subscriptions?publicationId=${encodeURIComponent(publicationId)}`, {
        method,
      })
      const payload = (await response.json().catch(() => null)) as { error?: string } | null

      if (!response.ok) {
        throw new Error(payload?.error || 'Subscription update failed')
      }

      setSubscribed(!subscribed)
      setMessage(subscribed ? 'Unsubscribed successfully.' : 'Subscribed successfully.')
      router.refresh()
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Subscription update failed')
    } finally {
      setLoading(false)
    }
  }

  if (isOwner) {
    return (
      <Button size={buttonSize} variant="outline" disabled>
        Your publication
      </Button>
    )
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <Button
        size={buttonSize}
        variant={subscribed ? 'outline' : 'primary'}
        onClick={handleToggle}
        disabled={loading}
      >
        {loading ? 'Updating...' : subscribed ? 'Subscribed' : 'Subscribe'}
      </Button>
      {message && <p className="text-xs text-gray-700">{message}</p>}
    </div>
  )
}
