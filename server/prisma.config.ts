import { defineConfig } from '@prisma/config';

// Load environment variables from .env file in root
try {
  process.loadEnvFile(); 
} catch (e) {
  // Ignore if .env missing or already loaded
}

export default defineConfig({
  schema: './prisma/schema.prisma',
  datasource: {
    url: process.env.DATABASE_URL || process.env.DIRECT_URL,
  },
});
