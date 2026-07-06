const { execSync } = require('node:child_process')
const { Pool } = require('pg')
const { getTestDatabaseUrl } = require('./utils.cjs')

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function run(command, label) {
  const maxAttempts = 5

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      execSync(command, {
        stdio: 'pipe',
        env: {
          ...process.env,
          DATABASE_URL: getTestDatabaseUrl(),
        },
      })

      return
    } catch (error) {
      if (attempt === maxAttempts) {
        throw error
      }

      const waitMs = attempt * 5000
      await sleep(waitMs)
    }
  }
}

function quoteIdentifier(identifier) {
  if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(identifier)) {
    throw new Error(`Unsafe schema identifier: ${identifier}`)
  }

  return `"${identifier}"`
}

async function resetSchemaDirectly() {
  const testDatabaseUrl = getTestDatabaseUrl()
  const parsed = new URL(testDatabaseUrl)
  const schema = parsed.searchParams.get('schema') || 'booking_barber_test'
  const quotedSchema = quoteIdentifier(schema)

  const pool = new Pool({
    connectionString: testDatabaseUrl,
  })

  try {
    await pool.query(`DROP SCHEMA IF EXISTS ${quotedSchema} CASCADE; CREATE SCHEMA ${quotedSchema};`)
  } finally {
    await pool.end()
  }
}

async function main() {
  console.log('Resetting test database...')
  await resetSchemaDirectly()
  console.log('Applying latest test schema...')
  await run('npx prisma migrate deploy', 'migrate deploy')
  console.log('Test DB reset completed.')
}

main().catch((error) => {
  throw error
})
