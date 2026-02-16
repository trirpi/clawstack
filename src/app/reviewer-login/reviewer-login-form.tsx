'use client'

import { useState } from 'react'
import Link from 'next/link'
import { signIn } from 'next-auth/react'
import { useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/Button'

const errorMessages: Record<string, string> = {
  CredentialsSignin: 'Sign in failed. Please check your reviewer credentials.',
  Default: 'An error occurred during sign in. Please try again.',
}

export function ReviewerLoginForm() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error')
  const errorMessage = error ? (errorMessages[error] || errorMessages.Default) : null
  const callbackUrlParam = searchParams.get('callbackUrl')
  const callbackUrl =
    callbackUrlParam && callbackUrlParam.startsWith('/') && !callbackUrlParam.startsWith('//')
      ? callbackUrlParam
      : '/dashboard/admin'

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <Link href="/" className="inline-flex items-center gap-2">
            <span className="text-4xl">🦞</span>
            <span className="text-2xl font-bold text-gray-900">Clawstack</span>
          </Link>
          <h1 className="mt-6 text-3xl font-bold text-gray-900">Reviewer access</h1>
          <p className="mt-2 text-gray-600">Temporary credentials for compliance review only.</p>
        </div>

        {errorMessage && (
          <div className="rounded-lg bg-red-50 border border-red-200 p-4 text-sm text-red-700">
            {errorMessage}
          </div>
        )}

        <form
          className="space-y-3 rounded-lg border border-black/10 bg-white p-4"
          onSubmit={(event) => {
            event.preventDefault()
            signIn('reviewer', {
              username: username.trim(),
              password,
              callbackUrl,
            })
          }}
        >
          <input
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            type="text"
            autoComplete="username"
            placeholder="Username"
            className="w-full rounded-md border border-black/15 px-3 py-2 text-sm focus:border-amber-700 focus:outline-none focus:ring-1 focus:ring-amber-700"
            required
          />
          <input
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            type="password"
            autoComplete="current-password"
            placeholder="Password"
            className="w-full rounded-md border border-black/15 px-3 py-2 text-sm focus:border-amber-700 focus:outline-none focus:ring-1 focus:ring-amber-700"
            required
          />
          <Button type="submit" variant="outline" className="w-full">
            Sign in as Reviewer
          </Button>
        </form>
      </div>
    </div>
  )
}
