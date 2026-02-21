import { config } from 'dotenv';
import { statSync } from 'fs';
import './test/extensions.js';

if (!process.env.CI) {
  const envPath = '.env.local';
  try {
    statSync(envPath);
    config({ path: envPath });
  } catch {
    // In local runs we allow missing env to keep tests runnable with defaults
  }
}

// Provide a default Anthropics API key for tests to avoid network/key errors.
process.env.ANTHROPIC_API_KEY ??= 'test-key';
