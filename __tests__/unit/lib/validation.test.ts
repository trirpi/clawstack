import { describe, expect, it } from 'vitest'
import {
  escapeCsvCell,
  hasSameOriginHeader,
  validateCommentPayload,
  validateCommentVotePayload,
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

  it('rejects post payloads with invalid slugs', () => {
    const payload = validatePostPayload({
      publicationId: 'pub_1',
      title: 'Hello',
      slug: 'Hello World',
      content: '<p>Hi</p>',
      category: 'ARTICLE',
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

  it('rejects settings payloads with empty publication name', () => {
    const payload = validateSettingsPayload({
      publication: { name: '   ', description: 'Desc' },
    })

    expect(payload).toBeNull()
  })

  it('validates comment payloads', () => {
    expect(validateCommentPayload({ postId: 'post_1', content: 'hello' })).toEqual({
      postId: 'post_1',
      content: 'hello',
      parentId: null,
    })
    expect(
      validateCommentPayload({ postId: 'post_1', content: 'hello', parentId: 'comment_1' }),
    ).toEqual({
      postId: 'post_1',
      content: 'hello',
      parentId: 'comment_1',
    })
    expect(validateCommentPayload({ postId: 'post_1', content: '' })).toBeNull()
  })

  it('validates comment vote payloads', () => {
    expect(validateCommentVotePayload({ commentId: 'comment_1' })).toEqual({
      commentId: 'comment_1',
    })
    expect(validateCommentVotePayload({ commentId: '' })).toBeNull()
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

  it('rejects report payloads with invalid reason or email', () => {
    expect(
      validateReportPayload({
        postId: 'post_1',
        publicationId: 'pub_1',
        reason: 'spam',
      }),
    ).toBeNull()

    expect(
      validateReportPayload({
        postId: 'post_1',
        publicationId: 'pub_1',
        reason: 'copyright',
        reporterEmail: 'not-an-email',
      }),
    ).toBeNull()
  })

  it('rejects report payloads with invalid source URL', () => {
    expect(
      validateReportPayload({
        postId: 'post_1',
        publicationId: 'pub_1',
        reason: 'copyright',
        sourceUrl: 'javascript:alert(1)',
      }),
    ).toBeNull()
  })

  it('rejects report payloads with invalid slugs', () => {
    expect(
      validateReportPayload({
        postId: 'post_1',
        publicationId: 'pub_1',
        reason: 'copyright',
        postSlug: 'Bad Slug',
      }),
    ).toBeNull()
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

  it('allows same-origin referer when origin header is missing', () => {
    process.env.NEXTAUTH_URL = 'https://example.com'
    const request = new Request('https://example.com/api/test', {
      headers: { referer: 'https://example.com/dashboard' },
    })

    expect(hasSameOriginHeader(request)).toBe(true)
  })

  it('rejects state-changing requests without origin or referer when app url is configured', () => {
    process.env.NEXTAUTH_URL = 'https://example.com'
    const request = new Request('https://example.com/api/test')
    expect(hasSameOriginHeader(request)).toBe(false)
  })

  it('rejects missing origin/referer in production when NEXTAUTH_URL is missing', () => {
    const previousNodeEnv = process.env.NODE_ENV
    const previousAppUrl = process.env.NEXTAUTH_URL
    process.env.NODE_ENV = 'production'
    delete process.env.NEXTAUTH_URL

    const request = new Request('https://example.com/api/test')
    expect(hasSameOriginHeader(request)).toBe(false)

    process.env.NODE_ENV = previousNodeEnv
    process.env.NEXTAUTH_URL = previousAppUrl
  })

  it('escapes csv formula cells', () => {
    expect(escapeCsvCell('=SUM(1,2)')).toBe("'=SUM(1,2)")
    expect(escapeCsvCell('safe')).toBe('safe')
  })
})
