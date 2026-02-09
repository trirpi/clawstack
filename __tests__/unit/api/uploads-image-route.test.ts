import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { NextRequest } from 'next/server'

const {
  getSessionMock,
  putMock,
  mkdirMock,
  writeFileMock,
} = vi.hoisted(() => ({
  getSessionMock: vi.fn(),
  putMock: vi.fn(),
  mkdirMock: vi.fn(),
  writeFileMock: vi.fn(),
}))

vi.mock('@/lib/auth', () => ({
  getSession: getSessionMock,
}))

vi.mock('@vercel/blob', () => ({
  put: putMock,
}))

vi.mock('fs/promises', () => ({
  mkdir: mkdirMock,
  writeFile: writeFileMock,
  default: {
    mkdir: mkdirMock,
    writeFile: writeFileMock,
  },
}))

import { POST } from '@/app/api/uploads/image/route'

function requestWithFormData(formData: FormData) {
  return {
    formData: vi.fn().mockResolvedValue(formData),
  } as unknown as NextRequest
}

function createImageFile(
  content: BlobPart[],
  name = 'image.png',
  type = 'image/png',
) {
  const file = new File(content, name, { type })

  if (typeof (file as File & { arrayBuffer?: unknown }).arrayBuffer !== 'function') {
    const firstPart = content[0]
    const fallbackBuffer = (() => {
      if (typeof firstPart === 'string') {
        return new TextEncoder().encode(firstPart).buffer
      }

      if (firstPart instanceof Uint8Array) {
        return firstPart.buffer.slice(firstPart.byteOffset, firstPart.byteOffset + firstPart.byteLength)
      }

      if (firstPart instanceof ArrayBuffer) {
        return firstPart
      }

      return new ArrayBuffer(0)
    })()

    Object.defineProperty(file, 'arrayBuffer', {
      value: vi.fn(async () => fallbackBuffer),
    })
  }

  return file
}

describe('POST /api/uploads/image', () => {
  const originalBlobToken = process.env.BLOB_READ_WRITE_TOKEN
  const originalVercel = process.env.VERCEL

  beforeEach(() => {
    vi.clearAllMocks()
    process.env.BLOB_READ_WRITE_TOKEN = originalBlobToken
    process.env.VERCEL = originalVercel
  })

  it('returns 401 when user is not authenticated', async () => {
    getSessionMock.mockResolvedValue(null)

    const response = await POST(requestWithFormData(new FormData()))
    expect(response.status).toBe(401)
  })

  it('returns 400 when file is missing', async () => {
    getSessionMock.mockResolvedValue({ user: { id: 'user_1' } })

    const response = await POST(requestWithFormData(new FormData()))
    const body = await response.json()

    expect(response.status).toBe(400)
    expect(body.error).toContain('Image file is required')
  })

  it('returns 400 for unsupported mime types', async () => {
    getSessionMock.mockResolvedValue({ user: { id: 'user_1' } })
    const formData = new FormData()
    formData.append('file', createImageFile(['<svg></svg>'], 'icon.svg', 'image/svg+xml'))

    const response = await POST(requestWithFormData(formData))
    expect(response.status).toBe(400)
  })

  it('returns 400 for oversized files', async () => {
    getSessionMock.mockResolvedValue({ user: { id: 'user_1' } })
    const tooLarge = new Uint8Array(4 * 1024 * 1024 + 1)
    const formData = new FormData()
    formData.append('file', createImageFile([tooLarge], 'large.png', 'image/png'))

    const response = await POST(requestWithFormData(formData))
    expect(response.status).toBe(400)
  })

  it('uploads to Vercel Blob when token is available', async () => {
    process.env.BLOB_READ_WRITE_TOKEN = 'token'
    getSessionMock.mockResolvedValue({ user: { id: 'user_1' } })
    putMock.mockResolvedValue({ url: 'https://example.blob.vercel-storage.com/uploads/test.png' })

    const formData = new FormData()
    formData.append('file', createImageFile(['abc'], 'image.png', 'image/png'))

    const response = await POST(requestWithFormData(formData))
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(putMock).toHaveBeenCalledTimes(1)
    expect(body.url).toContain('blob.vercel-storage.com/uploads/')
    expect(mkdirMock).not.toHaveBeenCalled()
    expect(writeFileMock).not.toHaveBeenCalled()
  })

  it('falls back to local public/uploads when blob token is missing', async () => {
    delete process.env.VERCEL
    delete process.env.BLOB_READ_WRITE_TOKEN
    getSessionMock.mockResolvedValue({ user: { id: 'user_1' } })

    const formData = new FormData()
    formData.append('file', createImageFile(['abc'], 'image.png', 'image/png'))

    const response = await POST(requestWithFormData(formData))
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(putMock).not.toHaveBeenCalled()
    expect(mkdirMock).toHaveBeenCalledTimes(1)
    expect(writeFileMock).toHaveBeenCalledTimes(1)
    expect(body.url).toMatch(/^\/uploads\/.+\.png$/)
  })

  it('returns 503 on Vercel when blob token is missing', async () => {
    process.env.VERCEL = '1'
    delete process.env.BLOB_READ_WRITE_TOKEN
    getSessionMock.mockResolvedValue({ user: { id: 'user_1' } })

    const formData = new FormData()
    formData.append('file', createImageFile(['abc'], 'image.png', 'image/png'))

    const response = await POST(requestWithFormData(formData))
    const body = await response.json()

    expect(response.status).toBe(503)
    expect(body.error).toContain('BLOB_READ_WRITE_TOKEN')
  })
})
