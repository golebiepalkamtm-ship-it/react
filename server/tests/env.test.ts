
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { loadConfig } from '../lib/env' 

function withEnv(vars: Record<string, string>, fn: () => void) {
  const old = process.env
  process.env = { ...old, ...vars }
  try { fn() } finally { process.env = old }
}

describe('env config', () => {

  it('rzuca wyjątek gdy brakuje wymaganych zmiennych', () => {
    withEnv({ NODE_ENV: 'test', DATABASE_URL: '' }, () => {
      expect(() => loadConfig()).toThrowError(/Environment validation failed/i)
    })
  })

  it('parsuje liczby i wartości boolean', () => {
    withEnv({
      PORT: '4000',
      REDIS_HOST: 'localhost',
      SUPABASE_URL: 'https://example.com',
      SUPABASE_ANON_KEY: 'public-anon-key',
      SUPABASE_SERVICE_ROLE_KEY: 'service-role-key',
      SUPABASE_SECRET_ACCESS_KEY: 'test-access-key-not-real',
      SUPABASE_SECRET_SECRET_KEY: 'test-secret-key-not-real',
      SUPABASE_BUCKET: 'bucket',
      SUPABASE_BUCKET_PUBLIC: 'public-bucket',
      DATABASE_URL: 'postgresql://...',
      SESSION_SECRET: 'this-is-a-properly-long-test-session-secret-for-unit-tests-only',
      // Mock mandatory fields
    }, () => {
      const cfg = loadConfig()
      expect(cfg.PORT).toBe(4000)
    })
  })
})
