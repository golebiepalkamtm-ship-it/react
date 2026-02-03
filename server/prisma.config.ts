import path from 'node:path';
import { defineConfig } from 'prisma/config';

export default defineConfig({
  earlyAccess: true,
  schema: path.join(__dirname, 'prisma', 'schema.prisma'),
  
  datasource: {
    url: 'postgresql://postgres.nctvwxiqzbedgcmetyal:Milosz.120588@aws-1-eu-west-1.pooler.supabase.com:6543/postgres',
  },
});
