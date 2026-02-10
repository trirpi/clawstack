import { beforeEach, describe, expect, it, vi } from 'vitest'

const {
  hasSameOriginHeaderMock,
  validateReportPayloadMock,
  reportCountMock,
  reportFindFirstMock,
  reportCreateMock,
  postFindUniqueMock,
} = vi.hoisted(() => ({
  hasSameOriginHeaderMock: vi.fn(),
  validateReportPayloadMock: vi.fn(),
  reportCountMock: vi.fn(),
  reportFindFirstMock: vi.fn(),
  reportCreateMock: vi.fn(),
  postFindUniqueMock: vi.fn(),
}))

vi.mock('@/lib/validation', () => ({
  hasSameOriginHeader: hasSameOriginHeaderMock,
  validateReportPayload: validateReportPayloadMock,
}))

vi.mock('@/lib/prisma', () => ({
  prisma: {
    report: {
      count: reportCountMock,
      findFirst: reportFindFirstMock,
      create: reportCreateMock,
    },
    post: {
      findUnique: postFindUniqueMock,
    },
  },
}))

import { POST } from '@/app/api/reports/route'

function createRequest(body: unknown, headers?: Record<string, string>) {
  return new Request('http://localhost/api/reports', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      ...(headers || {}),
    },
    body: JSON.stringify(body),
  })
}

const validPayload = {
  postId: 'post_1',
  publicationId: 'pub_1',
  reason: 'copyright',
  reporterEmail: 'test@example.com',
  details: 'Please review',
  postSlug: 'example-post',
  publicationSlug: 'example-publication',
  sourceUrl: 'https://example.com/example-publication/example-post',
}

describe('POST /api/reports', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    hasSameOriginHeaderMock.mockReturnValue(true)
    reportCountMock.mockResolvedValue(0)
    validateReportPayloadMock.mockReturnValue(validPayload)
    postFindUniqueMock.mockResolvedValue({
      id: 'post_1',
      publicationId: 'pub_1',
      published: true,
    })
    reportFindFirstMock.mockResolvedValue(null)
    reportCreateMock.mockResolvedValue({ id: 'report_1' })
  })

  it('returns 403 for invalid origin', async () => {
    hasSameOriginHeaderMock.mockReturnValue(false)

    const response = await POST(createRequest(validPayload))
    expect(response.status).toBe(403)
  })

  it('returns 429 when rate limit is exceeded', async () => {
    reportCountMock.mockResolvedValue(10)

    const response = await POST(createRequest(validPayload, { 'x-forwarded-for': '1.2.3.4' }))
    expect(response.status).toBe(429)
  })

  it('returns 400 for invalid payload', async () => {
    validateReportPayloadMock.mockReturnValue(null)

    const response = await POST(createRequest({}))
    expect(response.status).toBe(400)
  })

  it('returns 400 when report target does not match a published post', async () => {
    postFindUniqueMock.mockResolvedValue({
      id: 'post_1',
      publicationId: 'different-publication',
      published: true,
    })

    const response = await POST(createRequest(validPayload))
    expect(response.status).toBe(400)
  })

  it('deduplicates repeat reports for the same post and reporter ip', async () => {
    reportFindFirstMock.mockResolvedValue({ id: 'existing-report-id' })

    const response = await POST(createRequest(validPayload, { 'x-forwarded-for': '1.2.3.4' }))
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body.deduplicated).toBe(true)
    expect(reportCreateMock).not.toHaveBeenCalled()
  })

  it('creates a new report when payload is valid and no duplicate exists', async () => {
    const response = await POST(createRequest(validPayload, { 'x-forwarded-for': '1.2.3.4' }))
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body.success).toBe(true)
    expect(reportCreateMock).toHaveBeenCalledTimes(1)
  })
})
