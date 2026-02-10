import 'dotenv/config'
import { defineConfig } from 'prisma/config'

const databaseUrl =
  process.env.DATABASE_URL ?? 'postgresql://user:password@localhost:5432/database'
const shadowDatabaseUrl = process.env.SHADOW_DATABASE_URL

export default defineConfig({
  schema: 'prisma/schema.prisma',
  datasource: {
    url: databaseUrl,
    ...(shadowDatabaseUrl ? { shadowDatabaseUrl } : {}),
  },
})
