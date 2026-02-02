import { test, expect } from '@playwright/test'

test.describe('API Routes', () => {
  test('POST /api/posts should require authentication', async ({ request }) => {
    const response = await request.post('/api/posts', {
      data: {
        title: 'Test Post',
        content: 'Test content',
      },
    })
    
    expect(response.status()).toBe(401)
    const body = await response.json()
    expect(body.error).toBe('Unauthorized')
  })

  test('PUT /api/posts should require authentication', async ({ request }) => {
    const response = await request.put('/api/posts', {
      data: {
        id: 'test-id',
        title: 'Updated Post',
      },
    })
    
    expect(response.status()).toBe(401)
  })

  test('POST /api/comments should require authentication', async ({ request }) => {
    const response = await request.post('/api/comments', {
      data: {
        postId: 'test-post-id',
        content: 'Test comment',
      },
    })
    
    expect(response.status()).toBe(401)
  })

  test('DELETE /api/comments should require authentication', async ({ request }) => {
    const response = await request.delete('/api/comments?id=test-id')
    
    expect(response.status()).toBe(401)
  })

  test('POST /api/stripe/checkout should require authentication', async ({ request }) => {
    const response = await request.post('/api/stripe/checkout', {
      data: {
        publicationId: 'test-pub-id',
        priceId: 'price_test',
      },
    })
    
    expect(response.status()).toBe(401)
  })

  test('GET /api/download/[postId] should return 404 for non-existent post', async ({ request }) => {
    const response = await request.get('/api/download/nonexistent-post-id')
    
    expect(response.status()).toBe(404)
  })

  test('GET /api/auth/session should return session info', async ({ request }) => {
    const response = await request.get('/api/auth/session')
    
    expect(response.status()).toBe(200)
    const body = await response.json()
    // Should return empty object for unauthenticated
    expect(typeof body).toBe('object')
  })

  test('GET /api/auth/providers should return OAuth providers', async ({ request }) => {
    const response = await request.get('/api/auth/providers')
    
    expect(response.status()).toBe(200)
    const body = await response.json()
    expect(body).toHaveProperty('github')
  })
})
