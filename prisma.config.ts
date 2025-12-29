import 'dotenv/config'
import { defineConfig } from 'prisma/config'

export default defineConfig({
  schema: './prisma/schema.prisma',
  migrations: {
    path: './prisma/migrations'
  },
  datasource: {
    // Use process.env to avoid throwing during `prisma` commands when DATABASE_URL is not set
    url: process.env.DATABASE_URL ?? ''
  }
})
