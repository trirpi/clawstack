import { randomUUID } from 'crypto'
import { mkdir, writeFile } from 'fs/promises'
import path from 'path'
import { put } from '@vercel/blob'
import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { consumeRateLimit, rateLimitResponse } from '@/lib/rateLimit'
import { scanTextForPolicyViolations } from '@/lib/moderationScan'
import { hasSameOriginHeader } from '@/lib/validation'

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

function detectImageExtension(bytes: Uint8Array): string | null {
  if (
    bytes[0] === 0xff &&
    bytes[1] === 0xd8 &&
    bytes[2] === 0xff
  ) {
    return 'jpg'
  }

  if (
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47
  ) {
    return 'png'
  }

  if (
    bytes[0] === 0x47 &&
    bytes[1] === 0x49 &&
    bytes[2] === 0x46 &&
    bytes[3] === 0x38
  ) {
    return 'gif'
  }

  if (
    bytes[0] === 0x52 &&
    bytes[1] === 0x49 &&
    bytes[2] === 0x46 &&
    bytes[3] === 0x46 &&
    bytes[8] === 0x57 &&
    bytes[9] === 0x45 &&
    bytes[10] === 0x42 &&
    bytes[11] === 0x50
  ) {
    return 'webp'
  }

  const brand = String.fromCharCode(
    bytes[8] || 0,
    bytes[9] || 0,
    bytes[10] || 0,
    bytes[11] || 0,
    bytes[12] || 0,
    bytes[13] || 0,
    bytes[14] || 0,
    bytes[15] || 0,
  )

  if (brand.includes('avif')) {
    return 'avif'
  }

  return null
}

export async function POST(request: NextRequest) {
  const session = await getSession()

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  if (!hasSameOriginHeader(request)) {
    return NextResponse.json({ error: 'Invalid request origin' }, { status: 403 })
  }
  const rateLimit = consumeRateLimit({
    request,
    key: 'api:uploads:image',
    limit: 40,
    windowMs: 10 * 60 * 1000,
    identifier: session.user.id,
  })
  if (!rateLimit.allowed) {
    return rateLimitResponse(rateLimit, 'Too many image uploads. Please wait and retry.')
  }

  const formData = await request.formData()
  const file = formData.get('file')

  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'Image file is required' }, { status: 400 })
  }
  const filenameModeration = scanTextForPolicyViolations(file.name)
  if (filenameModeration.blocked) {
    return NextResponse.json({ error: 'Image filename violates the Acceptable Use Policy.' }, { status: 400 })
  }

  if (file.size <= 0) {
    return NextResponse.json({ error: 'Image file is empty.' }, { status: 400 })
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    return NextResponse.json({ error: 'Image must be 4MB or smaller.' }, { status: 400 })
  }

  const fullBuffer = new Uint8Array(await file.arrayBuffer())
  const bytes = fullBuffer.subarray(0, 32)
  const declaredExtension = ALLOWED_MIME_TYPES[file.type]
  const detectedExtension = detectImageExtension(bytes)

  if (!declaredExtension || !detectedExtension) {
    return NextResponse.json(
      { error: 'Unsupported image type. Use PNG, JPG, WEBP, GIF, or AVIF.' },
      { status: 400 },
    )
  }

  if (declaredExtension !== detectedExtension) {
    return NextResponse.json({ error: 'Image type mismatch.' }, { status: 400 })
  }
  const extension = detectedExtension

  const safeBaseName = file.name
    .toLowerCase()
    .replace(/\.[^.]+$/, '')
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40)

  const fallbackBaseName = safeBaseName || 'image'
  const filename = `${Date.now()}-${randomUUID()}-${fallbackBaseName}.${extension}`

  if (process.env.VERCEL && !process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json(
      { error: 'Blob storage is not configured. Set BLOB_READ_WRITE_TOKEN.' },
      { status: 503 },
    )
  }

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
  await writeFile(destination, Buffer.from(fullBuffer))

  return NextResponse.json({ url: `/uploads/${filename}` })
}
