import { describe, expect, it } from 'vitest'
import {
  escapeCsvCell,
  hasSameOriginHeader,
  validateCommentPayload,
  validateNewsletterPayload,
  validateReportPayload,
  validatePostPayload,
  validateSettingsPayload,
} from '@/lib/validation'

describe('validation helpers', () => {
  it('validates and normalizes post payloads', () => {
    const payload = validatePostPayload({
      publicationId: 'pub_1',
      title: 'Hello',
      slug: 'hello',
      content: '<p>Hi</p>',
      excerpt: 'excerpt',
      category: 'ARTICLE',
      visibility: 'FREE',
      published: true,
    })

    expect(payload).not.toBeNull()
    expect(payload?.published).toBe(true)
  })

  it('rejects invalid post categories', () => {
    const payload = validatePostPayload({
      publicationId: 'pub_1',
      title: 'Hello',
      slug: 'hello',
      content: '<p>Hi</p>',
      category: 'UNKNOWN',
      visibility: 'FREE',
      published: false,
    })

    expect(payload).toBeNull()
  })

  it('validates settings payloads', () => {
    const payload = validateSettingsPayload({
      publication: { name: 'Publication', description: 'Desc', priceMonthly: 500, priceYearly: 5000 },
      user: { name: 'Name', bio: 'Bio' },
    })

    expect(payload?.publication?.priceMonthly).toBe(500)
    expect(payload?.user?.name).toBe('Name')
  })

  it('validates comment payloads', () => {
    expect(validateCommentPayload({ postId: 'post_1', content: 'hello' })).toEqual({
      postId: 'post_1',
      content: 'hello',
    })
    expect(validateCommentPayload({ postId: 'post_1', content: '' })).toBeNull()
  })

  it('validates newsletter payloads', () => {
    expect(validateNewsletterPayload({ subject: 'S', content: 'Body' })).toEqual({
      subject: 'S',
      content: 'Body',
    })
    expect(validateNewsletterPayload({ subject: '', content: 'Body' })).toBeNull()
  })

  it('validates report payloads', () => {
    const payload = validateReportPayload({
      postId: 'post_1',
      publicationId: 'pub_1',
      reason: 'copyright',
      reporterEmail: 'test@example.com',
      details: 'Details',
      postSlug: 'slug',
      publicationSlug: 'pub',
      sourceUrl: 'https://example.com/pub/slug',
    })

    expect(payload?.postId).toBe('post_1')
    expect(payload?.publicationId).toBe('pub_1')
    expect(payload?.reason).toBe('copyright')
  })

  it('checks same origin headers', () => {
    process.env.NEXTAUTH_URL = 'https://example.com'
    const sameOriginRequest = new Request('https://example.com/api/test', {
      headers: { origin: 'https://example.com' },
    })
    const crossOriginRequest = new Request('https://example.com/api/test', {
      headers: { origin: 'https://evil.com' },
    })

    expect(hasSameOriginHeader(sameOriginRequest)).toBe(true)
    expect(hasSameOriginHeader(crossOriginRequest)).toBe(false)
  })

  it('escapes csv formula cells', () => {
    expect(escapeCsvCell('=SUM(1,2)')).toBe("'=SUM(1,2)")
    expect(escapeCsvCell('safe')).toBe('safe')
  })
})
