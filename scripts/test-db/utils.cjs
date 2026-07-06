const path = require('node:path')
const dotenv = require('dotenv')

const LOCAL_HOST_MARKERS = ['localhost', '127.0.0.1']

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })
dotenv.config()

function ensureTestSchema(rawUrl) {
  const parsed = new URL(rawUrl)
  const existingSchema = parsed.searchParams.get('schema')

  if (!existingSchema) {
    parsed.searchParams.set('schema', 'booking_barber_test')
  }

  return parsed.toString()
}

function normalizeSslMode(rawUrl) {
  const parsed = new URL(rawUrl)
  const sslMode = parsed.searchParams.get('sslmode')

  if (sslMode === 'prefer' || sslMode === 'require' || sslMode === 'verify-ca') {
    parsed.searchParams.set('sslmode', 'verify-full')
  }

  return parsed.toString()
}

function ensureUrlExists(rawUrl) {
  if (!rawUrl) {
    throw new Error(
      'DATABASE_URL_TEST is not set and DATABASE_URL is unavailable. Add DATABASE_URL_TEST or DATABASE_URL to local environment.'
    )
  }

  return rawUrl
}

function getTestDatabaseUrl() {
  const candidate = process.env.DATABASE_URL_TEST || process.env.DATABASE_URL
  const rawUrl = ensureUrlExists(candidate)
  const normalizedUrl = process.env.DATABASE_URL_TEST ? rawUrl : ensureTestSchema(rawUrl)

  let parsed
  try {
    parsed = new URL(normalizedUrl)
  } catch {
    throw new Error('DATABASE_URL_TEST must be a valid PostgreSQL connection URL.')
  }

  const host = (parsed.hostname || '').toLowerCase()
  const schema = parsed.searchParams.get('schema') || ''
  const isLocalHost = LOCAL_HOST_MARKERS.some((marker) => host.includes(marker))
  const hasTestSchema = schema.toLowerCase().includes('test')

  if (!isLocalHost && !hasTestSchema) {
    throw new Error(
      'Safety check failed: DATABASE_URL_TEST must point to localhost or include a test schema (e.g. ?schema=booking_barber_test).'
    )
  }

  return normalizeSslMode(normalizedUrl)
}

module.exports = {
  getTestDatabaseUrl,
}
