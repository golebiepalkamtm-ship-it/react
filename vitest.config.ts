import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react-swc';
import path from 'path';
import dotenv from 'dotenv';

const envFile = process.env.VITEST_ENV_FILE ?? '.env.test';
dotenv.config({ path: envFile, override: false });

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'node',
    include: [
      'src/tests/**/*.{test,spec}.{ts,tsx}',
      'server/tests/**/*.{test,spec}.{ts,js}',
    ],
    exclude: [
      'node_modules',
      'dist',
      'server/node_modules',
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/**',
        'dist/**',
        '**/*.d.ts',
        'server/node_modules/**',
      ],
    },
    setupFiles: [],
    testTimeout: 10000,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
