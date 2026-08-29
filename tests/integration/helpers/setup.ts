import { config as loadDotenv } from 'dotenv'

loadDotenv({ path: '.env.local' })
loadDotenv()

if (process.env.DATABASE_URL_TEST) {
  process.env.DATABASE_URL = process.env.DATABASE_URL_TEST
} else if (process.env.DATABASE_URL) {
  const url = new URL(process.env.DATABASE_URL)
  if (!url.searchParams.get('schema')) {
    url.searchParams.set('schema', 'booking_barber_test')
  }
  process.env.DATABASE_URL = url.toString()
  process.env.DATABASE_URL_TEST = url.toString()
}

import { afterAll } from 'vitest'
import { integrationPool, integrationPrisma } from './db'

afterAll(async () => {
  await integrationPrisma.$disconnect()
  await integrationPool.end()
})
