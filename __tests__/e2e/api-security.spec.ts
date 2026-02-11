import { test, expect } from '@playwright/test'

test.describe('API Security', () => {
  test('rejects report payload with javascript source URL', async ({ request }) => {
    const response = await request.post('/api/reports', {
      headers: {
        origin: 'http://localhost:3000',
      },
      data: {
        postId: 'post_1',
        publicationId: 'pub_1',
        reason: 'copyright',
        sourceUrl: 'javascript:alert(1)',
      },
    })

    expect(response.status()).toBe(400)
  })

  test('rejects report payloads from cross origin', async ({ request }) => {
    const response = await request.post('/api/reports', {
      headers: {
        origin: 'https://evil.example',
      },
      data: {
        postId: 'post_1',
        publicationId: 'pub_1',
        reason: 'copyright',
      },
    })

    expect(response.status()).toBe(403)
  })

  test('rejects unauthenticated image uploads', async ({ request }) => {
    const response = await request.post('/api/uploads/image', {
      multipart: {
        file: {
          name: 'test.png',
          mimeType: 'image/png',
          buffer: Buffer.from('not-an-image'),
        },
      },
    })

    expect(response.status()).toBe(401)
  })

  test('requires authentication for vote endpoint', async ({ request }) => {
    const response = await request.post('/api/comments/upvote', {
      data: { commentId: 'comment_1' },
    })

    expect(response.status()).toBe(401)
  })
})
