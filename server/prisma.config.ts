import { defineConfig } from "@prisma/config";

import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from .env file in server directory
try {
  const envPath = path.join(__dirname, ".env");
  if (fs.existsSync(envPath)) {
    process.loadEnvFile(envPath);
  } else {
    process.loadEnvFile();
  }
} catch (e) {
  // Ignore if .env missing or already loaded
}

export default defineConfig({
  schema: "./prisma/schema.prisma",
  datasource: {
    url: process.env.DIRECT_URL || process.env.DATABASE_URL,
  },
});
