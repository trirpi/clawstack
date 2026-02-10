import { afterAll, beforeEach, describe, expect, it, vi } from 'vitest'
import type { NextRequest } from 'next/server'

const {
  getServerSessionMock,
  hasSameOriginHeaderMock,
  createCheckoutSessionMock,
  publicationFindUniqueMock,
  userFindUniqueMock,
} = vi.hoisted(() => ({
  getServerSessionMock: vi.fn(),
  hasSameOriginHeaderMock: vi.fn(),
  createCheckoutSessionMock: vi.fn(),
  publicationFindUniqueMock: vi.fn(),
  userFindUniqueMock: vi.fn(),
}))

vi.mock('next-auth', () => ({
  getServerSession: getServerSessionMock,
}))

vi.mock('@/lib/validation', () => ({
  hasSameOriginHeader: hasSameOriginHeaderMock,
}))

vi.mock('@/lib/stripe', () => ({
  createCheckoutSession: createCheckoutSessionMock,
}))

vi.mock('@/lib/prisma', () => ({
  prisma: {
    publication: {
      findUnique: publicationFindUniqueMock,
    },
    user: {
      findUnique: userFindUniqueMock,
    },
  },
}))

import { POST } from '@/app/api/stripe/checkout/route'

function createRequest(body: unknown) {
  return {
    json: vi.fn().mockResolvedValue(body),
    headers: new Headers({ origin: 'http://localhost:3000' }),
    nextUrl: new URL('http://localhost:3000/api/stripe/checkout'),
  } as unknown as NextRequest
}

describe('POST /api/stripe/checkout', () => {
  const previousMonthly = process.env.STRIPE_PRICE_MONTHLY_ID
  const previousYearly = process.env.STRIPE_PRICE_YEARLY_ID
  const previousNodeEnv = process.env.NODE_ENV
  const previousAppUrl = process.env.NEXTAUTH_URL

  beforeEach(() => {
    vi.clearAllMocks()
    process.env.STRIPE_PRICE_MONTHLY_ID = 'price_monthly'
    process.env.STRIPE_PRICE_YEARLY_ID = 'price_yearly'
    process.env.NODE_ENV = 'test'
    process.env.NEXTAUTH_URL = 'http://localhost:3000'

    getServerSessionMock.mockResolvedValue({ user: { id: 'user_1' } })
    hasSameOriginHeaderMock.mockReturnValue(true)
    publicationFindUniqueMock.mockResolvedValue({
      id: 'pub_1',
      slug: 'pub-one',
      userId: 'user_2',
      priceMonthly: 1000,
      priceYearly: 10000,
    })
    userFindUniqueMock.mockResolvedValue({
      id: 'user_1',
      stripeCustomerId: 'cus_123',
    })
    createCheckoutSessionMock.mockResolvedValue({
      url: 'https://checkout.stripe.test/session',
    })
  })

  it('returns 401 when user is not authenticated', async () => {
    getServerSessionMock.mockResolvedValue(null)
    const response = await POST(createRequest({ publicationId: 'pub_1', priceId: 'price_monthly' }))
    expect(response.status).toBe(401)
  })

  it('returns 403 for invalid origin', async () => {
    hasSameOriginHeaderMock.mockReturnValue(false)
    const response = await POST(createRequest({ publicationId: 'pub_1', priceId: 'price_monthly' }))
    expect(response.status).toBe(403)
  })

  it('returns 400 for invalid price selection', async () => {
    const response = await POST(createRequest({ publicationId: 'pub_1', priceId: 'price_custom' }))
    expect(response.status).toBe(400)
  })

  it('returns 400 when subscribing to own publication', async () => {
    publicationFindUniqueMock.mockResolvedValue({
      id: 'pub_1',
      slug: 'pub-one',
      userId: 'user_1',
      priceMonthly: 1000,
      priceYearly: 10000,
    })

    const response = await POST(createRequest({ publicationId: 'pub_1', priceId: 'price_monthly' }))
    expect(response.status).toBe(400)
  })

  it('returns 400 when selected plan is not available for the publication', async () => {
    publicationFindUniqueMock.mockResolvedValue({
      id: 'pub_1',
      slug: 'pub-one',
      userId: 'user_2',
      priceMonthly: null,
      priceYearly: 10000,
    })

    const response = await POST(createRequest({ publicationId: 'pub_1', priceId: 'price_monthly' }))
    expect(response.status).toBe(400)
  })

  it('returns 503 in production when billing price ids are not configured', async () => {
    process.env.NODE_ENV = 'production'
    delete process.env.STRIPE_PRICE_MONTHLY_ID
    delete process.env.STRIPE_PRICE_YEARLY_ID

    const response = await POST(createRequest({ publicationId: 'pub_1', priceId: 'price_monthly' }))
    expect(response.status).toBe(503)
  })

  it('creates checkout session with server-owned metadata', async () => {
    const response = await POST(createRequest({ publicationId: 'pub_1', priceId: 'price_monthly' }))
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body.url).toBe('https://checkout.stripe.test/session')
    expect(createCheckoutSessionMock).toHaveBeenCalledWith({
      priceId: 'price_monthly',
      customerId: 'cus_123',
      userId: 'user_1',
      publicationId: 'pub_1',
      successUrl: 'http://localhost:3000/pub-one?subscribed=true',
      cancelUrl: 'http://localhost:3000/pub-one',
    })
  })

  afterAll(() => {
    process.env.STRIPE_PRICE_MONTHLY_ID = previousMonthly
    process.env.STRIPE_PRICE_YEARLY_ID = previousYearly
    process.env.NODE_ENV = previousNodeEnv
    process.env.NEXTAUTH_URL = previousAppUrl
  })
})
