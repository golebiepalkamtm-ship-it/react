import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load env vars from root directory if not found in current
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env vars - order matters (first loaded wins by default in dotenv)
// 1. Root directory .env (monorepo structure) - load first for development
dotenv.config({ path: path.resolve(__dirname, '../.env') });
// 2. Local overrides in server directory
dotenv.config({ path: path.resolve(__dirname, '.env.local') });
// 3. Default env in server directory
dotenv.config({ path: path.resolve(__dirname, '.env') });

if (process.env.NODE_ENV !== 'production') {
  console.log('Environment variables loaded from:', __dirname);
  console.log('TWILIO_ACCOUNT_SID loaded:', !!process.env.TWILIO_ACCOUNT_SID);
  console.log('TWILIO_VERIFY_SERVICE_SID loaded:', !!process.env.TWILIO_VERIFY_SERVICE_SID);
}
