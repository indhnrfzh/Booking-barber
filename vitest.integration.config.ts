import { defineConfig } from 'vitest/config'

export default defineConfig({
  resolve: {
    tsconfigPaths: true,
  },
  test: {
    environment: 'node',
    globals: true,
    include: ['tests/integration/**/*.test.ts'],
    exclude: ['node_modules/**'],
    setupFiles: ['./tests/integration/helpers/setup.ts'],
    passWithNoTests: true,
  },
})
