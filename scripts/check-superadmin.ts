import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env vars
dotenv.config({ path: path.resolve(__dirname, '../server/.env.local') });
dotenv.config({ path: path.resolve(__dirname, '../server/.env.development') });
dotenv.config({ path: path.resolve(__dirname, '../server/.env') });
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});

async function main() {
  try {
    await prisma.$connect();
    
    const user = await (prisma as any).user.findUnique({
      where: { email: 'superadmin@palkamtm.pl' },
    });
    
    if (user) {
      console.log('User found:', JSON.stringify(user, null, 2));
    } else {
      console.log('User not found in DB');
    }
  } catch (error) {
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

main();