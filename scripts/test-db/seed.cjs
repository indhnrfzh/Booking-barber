const { execSync } = require('node:child_process')
const { getTestDatabaseUrl } = require('./utils.cjs')

function main() {
  console.log('Seeding test database...')

  execSync('npm run seed', {
    stdio: 'inherit',
    env: {
      ...process.env,
      DATABASE_URL: getTestDatabaseUrl(),
    },
  })

  console.log('Test DB seed completed.')
}

main()
