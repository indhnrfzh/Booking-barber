const { getTestDatabaseUrl } = require('./utils.cjs')

function main() {
  const testUrl = getTestDatabaseUrl()
  const parsed = new URL(testUrl)

  console.log('Test DB preflight passed:')
  console.log(`- Host: ${parsed.hostname}`)
  console.log(`- Database: ${parsed.pathname.replace('/', '') || '(default)'}`)
  console.log(`- Schema: ${parsed.searchParams.get('schema') || '(none)'}`)
}

main()
