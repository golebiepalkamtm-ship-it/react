import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env vars from server directory
dotenv.config({ path: path.resolve(__dirname, '../server/.env.local') });
dotenv.config({ path: path.resolve(__dirname, '../server/.env.development') });
dotenv.config({ path: path.resolve(__dirname, '../server/.env') });
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const url = process.env.DATABASE_URL;
console.log('DATABASE_URL set:', !!url);

if (!url) {
  console.error('DATABASE_URL not found in environment');
  process.exit(1);
}

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: url,
    },
  },
});

async function main() {
  try {
    console.log('Connecting to database...');
    await prisma.$connect();
    console.log('Connected.');
    
    const user = await (prisma as any).user.findUnique({
      where: { email: 'golebie.palka.mtm@gmail.com' },
    });
    
    if (user) {
      console.log('✅ Użytkownik znaleziony:');
      console.log(JSON.stringify(user, null, 2));
      
      const profile = await (prisma as any).profile.findUnique({
        where: { userId: user.id }
      });
      if (profile) {
        console.log('✅ Profil znaleziony:');
        console.log(JSON.stringify(profile, null, 2));
      } else {
        console.log('⚠️ Brak profilu dla tego użytkownika.');
      }
    } else {
      console.log('❌ Użytkownik o tym adresie email nie istnieje w bazie danych.');
    }
  } catch (error) {
    console.error('❌ Błąd podczas sprawdzania bazy danych:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
