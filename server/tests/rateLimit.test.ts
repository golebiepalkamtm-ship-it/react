
import { describe, it, expect } from 'vitest'
import request from 'supertest'
import app from '../app'
import jwt from 'jsonwebtoken'
import { validatedEnv } from '../lib/env'

describe('rate limiting', () => {
  it('ogranicza powtarzane żądania do endpointu login', async () => {
    // Note: Global rate limit is likely higher, but auth routes might have strict limits.
    // /api/auth/login is protected by authLimiter.
    // We need to trigger it enough times.
    // Warning: This effectively DDOSes the test instance if limits are high.
    // authLimiter is usually 5 reqs/15 min.
    
    const token = jwt.sign({ sub: 'test', role: 'USER', id: 'test' }, validatedEnv.JWT_SECRET)
    
    let status = 200
    for (let i = 0; i < 20; i++) {
        const res = await request(app)
            .post('/api/auth/otp/send')
            .set('Authorization', `Bearer ${token}`)
            .send({ phone: '+48123456789' })
        status = res.status
        if (status === 429) break
    }
    expect(status).toBe(429)
  })
})
