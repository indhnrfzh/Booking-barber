# Integration Test Helpers

- Use `integrationPrisma` from `db.ts` to run assertions directly to test database.
- Use `truncateAllTables()` when a suite needs full isolation before seeding custom fixtures.
- Integration tests are expected to use `DATABASE_URL_TEST` only.
