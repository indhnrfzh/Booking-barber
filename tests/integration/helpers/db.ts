import { config as loadDotenv } from 'dotenv'

import prismaPkg from '@prisma/client'
import type { PrismaClient as PrismaClientType } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'

const { PrismaClient } = prismaPkg

loadDotenv({ path: '.env.local' })
loadDotenv()

function getIntegrationDatabaseUrl() {
  const fromTest = process.env.DATABASE_URL_TEST
  if (fromTest) return fromTest

  const fallback = process.env.DATABASE_URL
  if (!fallback) return null

  const parsed = new URL(fallback)
  if (!parsed.searchParams.get('schema')) {
    parsed.searchParams.set('schema', 'booking_barber_test')
  }

  const normalized = parsed.toString()
  return normalizeDatabaseUrl(normalized)
}

function normalizeDatabaseUrl(rawUrl: string) {
  try {
    const url = new URL(rawUrl)
    const sslMode = url.searchParams.get('sslmode')

    if (sslMode === 'prefer' || sslMode === 'require' || sslMode === 'verify-ca') {
      url.searchParams.set('sslmode', 'verify-full')
    }

    return url.toString()
  } catch {
    return rawUrl
  }
}

function getSchemaSearchPath(rawUrl: string): string | undefined {
  try {
    const schema = new URL(rawUrl).searchParams.get('schema')
    return schema ? `-c search_path=${schema}` : undefined
  } catch {
    return undefined
  }
}

const testDatabaseUrl = getIntegrationDatabaseUrl()

if (!testDatabaseUrl) {
  throw new Error('DATABASE_URL_TEST is not set. Integration tests require a dedicated test database URL.')
}

const prismaClientSingleton = globalThis as unknown as {
  integrationPrisma?: PrismaClientType
  integrationPool?: Pool
}

const pool =
  prismaClientSingleton.integrationPool ||
  new Pool({
    connectionString: testDatabaseUrl,
    options: getSchemaSearchPath(testDatabaseUrl),
  })

function getPgSchema(rawUrl: string): string | undefined {
  try {
    return new URL(rawUrl).searchParams.get('schema') ?? undefined
  } catch {
    return undefined
  }
}

export const integrationPrisma =
  prismaClientSingleton.integrationPrisma ||
  new PrismaClient({
    adapter: new PrismaPg(pool, { schema: getPgSchema(testDatabaseUrl) }),
  })

export const integrationPool = pool

if (process.env.NODE_ENV !== 'production') {
  prismaClientSingleton.integrationPool = pool
  prismaClientSingleton.integrationPrisma = integrationPrisma
}

export async function truncateAllTables() {
  const tableNames = [
    '"Booking"',
    '"Service"',
    '"Schedule"',
    '"GalleryImage"',
    '"Testimonial"',
    '"SiteSettings"',
    '"Admin"',
  ]

  await integrationPrisma.$executeRawUnsafe(`TRUNCATE TABLE ${tableNames.join(', ')} RESTART IDENTITY CASCADE;`)
}
