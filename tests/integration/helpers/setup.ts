import { afterAll } from 'vitest'

import { integrationPool, integrationPrisma } from './db'

afterAll(async () => {
  await integrationPrisma.$disconnect()
  await integrationPool.end()
})
