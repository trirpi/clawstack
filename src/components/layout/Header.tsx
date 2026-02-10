'use client'

import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { Button } from '@/components/ui/Button'

export function Header() {
  const { data: session, status } = useSession()
  const isAuthenticated = status !== 'loading' && Boolean(session)

  return (
    <header className="sticky top-0 z-50 border-b border-black/20 bg-[#f8f4ea]/95 backdrop-blur supports-[backdrop-filter]:bg-[#f8f4ea]/80">
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2">
              <span className="text-2xl">🦞</span>
              <span className="deco-title text-xl font-semibold text-gray-900">Clawstack</span>
            </Link>
            <div className="hidden md:flex items-center gap-6">
              <Link
                href="/explore"
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                Explore
              </Link>
              <Link
                href="/pricing"
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                Pricing
              </Link>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <>
                <Link href="/dashboard">
                  <Button variant="ghost" size="sm">
                    Dashboard
                  </Button>
                </Link>
                <button
                  onClick={() => signOut()}
                  className="text-gray-600 hover:text-gray-900 text-sm"
                >
                  Sign out
                </button>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" size="sm">
                    Sign in
                  </Button>
                </Link>
                <Link href="/login">
                  <Button size="sm">Get Started</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>
    </header>
  )
}
