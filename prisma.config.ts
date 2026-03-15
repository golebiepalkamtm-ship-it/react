import { config } from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load env vars from root directory if not found in current
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env vars - order matters (first loaded wins by default in dotenv)
// 1. Local overrides in server directory
config({ path: path.resolve(__dirname, 'server/.env.local'), override: true });
// 2. Default env in server directory
config({ path: path.resolve(__dirname, 'server/.env'), override: true });
// 3. Root directory .env (monorepo structure) - fallback for shared vars
config({ path: path.resolve(__dirname, '.env') });

export default {
  generator: {
    client: {
      provider: 'prisma-client-js',
      outputMode: 'import',
    },
  },
  schema: './server/prisma/schema.prisma',
};
