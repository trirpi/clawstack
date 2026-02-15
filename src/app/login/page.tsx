'use client'

import { signIn } from 'next-auth/react'
import { useSearchParams } from 'next/navigation'
import { Suspense, useState } from 'react'
import { Button } from '@/components/ui/Button'
import Link from 'next/link'

const errorMessages: Record<string, string> = {
  Configuration: 'Server configuration error. Please contact support.',
  AccessDenied: 'Access denied. You may not have permission to sign in.',
  Verification: 'The verification link has expired or has already been used.',
  OAuthSignin: 'Error starting the sign in process. Please try again.',
  OAuthCallback: 'Error during authentication callback. Please try again.',
  OAuthCreateAccount: 'Could not create your account. Please try again.',
  EmailCreateAccount: 'Could not create your account. Please try again.',
  Callback: 'Authentication callback error. Please try again.',
  OAuthAccountNotLinked: 'This email is already associated with another account.',
  EmailSignin: 'Error sending the verification email. Please try again.',
  CredentialsSignin: 'Sign in failed. Please check your credentials.',
  SessionRequired: 'Please sign in to access this page.',
  Default: 'An error occurred during sign in. Please try again.',
}

function LoginContent() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error')
  const errorMessage = error ? (errorMessages[error] || errorMessages.Default) : null
  const callbackUrlParam = searchParams.get('callbackUrl')
  const callbackUrl =
    callbackUrlParam && callbackUrlParam.startsWith('/') && !callbackUrlParam.startsWith('//')
      ? callbackUrlParam
      : '/dashboard'
  const googleEnabled = process.env.NEXT_PUBLIC_GOOGLE_AUTH_ENABLED === 'true'
  const reviewerEnabled = process.env.NEXT_PUBLIC_REVIEWER_AUTH_ENABLED === 'true'
  const [reviewerUsername, setReviewerUsername] = useState('')
  const [reviewerPassword, setReviewerPassword] = useState('')

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <Link href="/" className="inline-flex items-center gap-2">
            <span className="text-4xl">🦞</span>
            <span className="text-2xl font-bold text-gray-900">Clawstack</span>
          </Link>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Welcome back
          </h2>
          <p className="mt-2 text-gray-600">
            Sign in to your account to continue
          </p>
        </div>

        {errorMessage && (
          <div className="rounded-lg bg-red-50 border border-red-200 p-4">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div>
                <h3 className="text-sm font-medium text-red-800">Sign in failed</h3>
                <p className="mt-1 text-sm text-red-700">{errorMessage}</p>
                {error === 'Configuration' && (
                  <p className="mt-2 text-xs text-red-600">
                    Error code: {error}. The administrator needs to configure OAuth credentials.
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="mt-8 space-y-4">
          <Button
            onClick={() => signIn('github', { callbackUrl })}
            className="w-full flex items-center justify-center gap-3"
            size="lg"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path
                fillRule="evenodd"
                d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                clipRule="evenodd"
              />
            </svg>
            Continue with GitHub
          </Button>

          {googleEnabled && (
            <Button
              onClick={() => signIn('google', { callbackUrl })}
              variant="secondary"
              className="w-full flex items-center justify-center gap-3 border border-black/15 bg-white"
              size="lg"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden>
                <path
                  fill="#EA4335"
                  d="M12 10.2v3.9h5.4c-.2 1.2-1.5 3.6-5.4 3.6-3.2 0-5.9-2.7-5.9-6s2.7-6 5.9-6c1.8 0 3 .8 3.7 1.5l2.5-2.4C16.6 3.3 14.5 2.3 12 2.3A9.7 9.7 0 0 0 2.3 12 9.7 9.7 0 0 0 12 21.7c5.6 0 9.3-3.9 9.3-9.4 0-.6-.1-1.1-.2-1.6H12Z"
                />
              </svg>
              Continue with Google
            </Button>
          )}

          {reviewerEnabled && (
            <form
              className="space-y-3 rounded-lg border border-black/10 bg-white p-4"
              onSubmit={(event) => {
                event.preventDefault()
                signIn('reviewer', {
                  username: reviewerUsername.trim(),
                  password: reviewerPassword,
                  callbackUrl,
                })
              }}
            >
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-600">
                Reviewer Access
              </div>
              <input
                value={reviewerUsername}
                onChange={(event) => setReviewerUsername(event.target.value)}
                type="text"
                autoComplete="username"
                placeholder="Username"
                className="w-full rounded-md border border-black/15 px-3 py-2 text-sm focus:border-amber-700 focus:outline-none focus:ring-1 focus:ring-amber-700"
                required
              />
              <input
                value={reviewerPassword}
                onChange={(event) => setReviewerPassword(event.target.value)}
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
          )}

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-gray-50 text-gray-500">
                Popular with developers
              </span>
            </div>
          </div>

          <p className="text-center text-sm text-gray-600">
            By signing in, you agree to our{' '}
            <Link href="/terms" className="text-amber-700 hover:underline">
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link href="/privacy" className="text-amber-700 hover:underline">
              Privacy Policy
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-pulse text-gray-400">Loading...</div>
      </div>
    }>
      <LoginContent />
    </Suspense>
  )
}
