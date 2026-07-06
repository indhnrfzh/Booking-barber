import prismaPkg from '@prisma/client'
import type { PrismaClient as PrismaClientType } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'

const { PrismaClient } = prismaPkg

const globalForPrisma = global as unknown as {
  prisma?: PrismaClientType
  pool?: Pool
}

const databaseUrl = process.env.DATABASE_URL

if (!databaseUrl) {
  throw new Error('DATABASE_URL is not set')
}

function normalizeDatabaseUrl(rawUrl: string): string {
  try {
    const url = new URL(rawUrl)
    const sslMode = url.searchParams.get('sslmode')

    // pg-connection-string warns for these legacy aliases; make intent explicit.
    if (sslMode === 'prefer' || sslMode === 'require' || sslMode === 'verify-ca') {
      url.searchParams.set('sslmode', 'verify-full')
    }

    return url.toString()
  } catch {
    // Keep original value if parsing fails (e.g. unexpected custom URL format).
    return rawUrl
  }
}

const normalizedDatabaseUrl = normalizeDatabaseUrl(databaseUrl)

function getSchemaSearchPath(rawUrl: string): string | undefined {
  try {
    const schema = new URL(rawUrl).searchParams.get('schema')
    return schema ? `-c search_path=${schema}` : undefined
  } catch {
    return undefined
  }
}

function getPgSchema(rawUrl: string): string | undefined {
  try {
    return new URL(rawUrl).searchParams.get('schema') ?? undefined
  } catch {
    return undefined
  }
}

const pool =
  globalForPrisma.pool ||
  new Pool({
    connectionString: normalizedDatabaseUrl,
    options: getSchemaSearchPath(normalizedDatabaseUrl),
  })

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    adapter: new PrismaPg(pool, { schema: getPgSchema(normalizedDatabaseUrl) }),
    log: ['error', 'warn'],
  })

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.pool = pool
  globalForPrisma.prisma = prisma
}
