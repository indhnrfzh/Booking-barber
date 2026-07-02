import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'

const globalForPrisma = global as unknown as {
  prisma?: PrismaClient
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

const pool =
  globalForPrisma.pool ||
  new Pool({
    connectionString: normalizedDatabaseUrl,
  })

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    adapter: new PrismaPg(pool),
    log: ['error', 'warn'],
  })

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.pool = pool
  globalForPrisma.prisma = prisma
}
