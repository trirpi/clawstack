import { randomUUID } from 'crypto'
import { mkdir, writeFile } from 'fs/promises'
import path from 'path'
import { put } from '@vercel/blob'
import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'

export const runtime = 'nodejs'

// Vercel serverless request payload limits are low, so keep uploads conservative.
const MAX_FILE_SIZE_BYTES = 4 * 1024 * 1024

const ALLOWED_MIME_TYPES: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
  'image/avif': 'avif',
}

export async function POST(request: NextRequest) {
  const session = await getSession()

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const formData = await request.formData()
  const file = formData.get('file')

  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'Image file is required' }, { status: 400 })
  }

  const extension = ALLOWED_MIME_TYPES[file.type]

  if (!extension) {
    return NextResponse.json(
      { error: 'Unsupported image type. Use PNG, JPG, WEBP, GIF, or AVIF.' },
      { status: 400 },
    )
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    return NextResponse.json({ error: 'Image must be 4MB or smaller.' }, { status: 400 })
  }

  const safeBaseName = file.name
    .toLowerCase()
    .replace(/\.[^.]+$/, '')
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40)

  const fallbackBaseName = safeBaseName || 'image'
  const filename = `${Date.now()}-${randomUUID()}-${fallbackBaseName}.${extension}`

  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const blob = await put(`uploads/${filename}`, file, {
      access: 'public',
      addRandomSuffix: false,
    })

    return NextResponse.json({ url: blob.url })
  }

  const uploadDirectory = path.join(process.cwd(), 'public', 'uploads')
  await mkdir(uploadDirectory, { recursive: true })
  const destination = path.join(uploadDirectory, filename)
  const bytes = await file.arrayBuffer()
  await writeFile(destination, Buffer.from(bytes))

  return NextResponse.json({ url: `/uploads/${filename}` })
}
