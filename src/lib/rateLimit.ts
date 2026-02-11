import { NextResponse } from 'next/server'

type RateLimitStore = Map<string, number[]>

type RateLimitInput = {
  request: Request
  key: string
  limit: number
  windowMs: number
  identifier?: string | null
}

export type RateLimitResult = {
  allowed: boolean
  limit: number
  remaining: number
  retryAfterSeconds: number
}

declare global {
  var __clawstackRateLimitStore: RateLimitStore | undefined
}

function getStore() {
  if (!globalThis.__clawstackRateLimitStore) {
    globalThis.__clawstackRateLimitStore = new Map()
  }
  return globalThis.__clawstackRateLimitStore
}

function normalizeIdentifier(value: string) {
  return value.replace(/[^\w:.-]/g, '_').slice(0, 120)
}

export function getClientIp(request: Request) {
  const forwardedFor = request.headers.get('x-forwarded-for')
  const realIp = request.headers.get('x-real-ip')
  const fallback =
    forwardedFor?.split(',')[0]?.trim() ||
    realIp?.trim() ||
    'unknown'

  return normalizeIdentifier(fallback || 'unknown')
}

export function consumeRateLimit({
  request,
  key,
  limit,
  windowMs,
  identifier,
}: RateLimitInput): RateLimitResult {
  const bucket = getStore()
  const now = Date.now()
  const actor = normalizeIdentifier(identifier || getClientIp(request))
  const bucketKey = `${key}:${actor}`

  const existing = bucket.get(bucketKey) || []
  const windowStart = now - windowMs
  const freshHits = existing.filter((hit) => hit > windowStart)

  if (freshHits.length >= limit) {
    const oldest = freshHits[0]
    const retryAfterMs = Math.max(windowMs - (now - oldest), 1_000)
    return {
      allowed: false,
      limit,
      remaining: 0,
      retryAfterSeconds: Math.ceil(retryAfterMs / 1_000),
    }
  }

  freshHits.push(now)
  bucket.set(bucketKey, freshHits)

  return {
    allowed: true,
    limit,
    remaining: Math.max(limit - freshHits.length, 0),
    retryAfterSeconds: 0,
  }
}

export function rateLimitResponse(result: RateLimitResult, message = 'Too many requests') {
  return NextResponse.json(
    { error: message },
    {
      status: 429,
      headers: {
        'Retry-After': String(result.retryAfterSeconds),
        'X-RateLimit-Limit': String(result.limit),
        'X-RateLimit-Remaining': String(result.remaining),
      },
    },
  )
}

export function resetRateLimitStore() {
  globalThis.__clawstackRateLimitStore?.clear()
}
