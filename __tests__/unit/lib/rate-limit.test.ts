import { beforeEach, describe, expect, it } from 'vitest'
import { consumeRateLimit, getClientIp, resetRateLimitStore } from '@/lib/rateLimit'

describe('rateLimit helper', () => {
  beforeEach(() => {
    resetRateLimitStore()
  })

  it('allows requests until limit is hit', () => {
    const request = new Request('http://localhost/api/test', {
      headers: { 'x-forwarded-for': '10.10.10.10' },
    })

    expect(
      consumeRateLimit({
        request,
        key: 'test',
        limit: 2,
        windowMs: 60_000,
      }).allowed,
    ).toBe(true)

    expect(
      consumeRateLimit({
        request,
        key: 'test',
        limit: 2,
        windowMs: 60_000,
      }).allowed,
    ).toBe(true)

    const denied = consumeRateLimit({
      request,
      key: 'test',
      limit: 2,
      windowMs: 60_000,
    })
    expect(denied.allowed).toBe(false)
    expect(denied.retryAfterSeconds).toBeGreaterThan(0)
  })

  it('uses distinct buckets for different identifiers', () => {
    const requestA = new Request('http://localhost/api/test', {
      headers: { 'x-forwarded-for': '1.1.1.1' },
    })
    const requestB = new Request('http://localhost/api/test', {
      headers: { 'x-forwarded-for': '2.2.2.2' },
    })

    consumeRateLimit({ request: requestA, key: 'test', limit: 1, windowMs: 60_000 })
    const secondBucket = consumeRateLimit({ request: requestB, key: 'test', limit: 1, windowMs: 60_000 })
    expect(secondBucket.allowed).toBe(true)
  })

  it('normalizes client ip values', () => {
    const request = new Request('http://localhost/api/test', {
      headers: { 'x-forwarded-for': '10.10.10.10, 9.9.9.9' },
    })
    expect(getClientIp(request)).toBe('10.10.10.10')
  })
})
