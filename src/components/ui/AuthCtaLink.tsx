'use client'

import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { buildLoginHref } from '@/lib/routes'

interface AuthCtaLinkProps {
  authenticatedHref: string
  callbackHref?: string
  children: React.ReactNode
}

export function AuthCtaLink({ authenticatedHref, callbackHref, children }: AuthCtaLinkProps) {
  const { status } = useSession()
  const isAuthenticated = status === 'authenticated'
  const href = isAuthenticated
    ? authenticatedHref
    : buildLoginHref(callbackHref || authenticatedHref)

  return <Link href={href}>{children}</Link>
}
