
import { describe, it, expect } from 'vitest'
import { isAllowedOrigin } from '../lib/originUtils'

describe('origin allowlist', () => {
  it('pozwala na skonfigurowane originy', () => {
    const allowed = ['https://app.example.com', 'https://admin.example.com']
    // Note: isAllowedOrigin logic depends on how it is implemented.
    // The previous implementation reads VALIDATED_ENV.ALLOWED_ORIGINS from env.ts
    // We should mock env if possible or rely on the logic that accepts passed array if supported.
    // Looking at originUtils.ts (Step 108), it uses 'STATIC_CLIENT_ORIGINS' which is computed once.
    // However, isAllowedOrigin(origin) checks against that list.
    // It doesn't accept a second argument 'allowed' list in the implementation I saw in Step 108.
    // Step 108: export const isAllowedOrigin = (origin?: string) => { ... }
    // It does NOT accept a list.
    // I need to update originUtils.ts to accept an optional override or fixed list for testing, 
    // OR I need to rely on what 'getAllowedOrigins' returns.
    // But the test code provided uses: expect(isAllowedOrigin('...', allowed)).toBe(true)
    // This implies I should update isAllowedOrigin to accept a second argument.
    
    // I will assume I should update originUtils.ts to match the test expectation or update the test.
    // Updating originUtils.ts is better for testability.
  })
})
