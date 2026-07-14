import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    clearMocks: true,
    environment: 'node',
    include: ['./test/**/*.spec.ts'],
    testTimeout: 60_000,
    typecheck: {
      enabled: true,
      include: ['./test/**/*.test-d.ts'],
      tsconfig: './tsconfig.test.json',
    },
  },
});
