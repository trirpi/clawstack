import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function createAdapter(databaseUrl: string) {
  if (databaseUrl.startsWith('file:') || databaseUrl === ':memory:') {
    return new PrismaBetterSqlite3({ url: databaseUrl })
  }

  if (
    databaseUrl.startsWith('postgresql:') ||
    databaseUrl.startsWith('postgres:') ||
    databaseUrl.startsWith('prisma+postgres:')
  ) {
    return new PrismaPg({ connectionString: databaseUrl })
  }

  throw new Error(`Unsupported DATABASE_URL protocol for Prisma: ${databaseUrl}`)
}

function createPrismaClient() {
  const databaseUrl = process.env.DATABASE_URL

  if (!databaseUrl) {
    throw new Error('DATABASE_URL is required to initialize Prisma Client')
  }

  return new PrismaClient({
    adapter: createAdapter(databaseUrl),
  })
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
