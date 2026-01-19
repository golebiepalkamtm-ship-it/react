
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

// Fix for Supabase Transaction Pooler
if (process.env.DATABASE_URL && !process.env.DATABASE_URL.includes('pgbouncer=true')) {
    const separator = process.env.DATABASE_URL.includes('?') ? '&' : '?';
    process.env.DATABASE_URL = `${process.env.DATABASE_URL}${separator}pgbouncer=true`;
    console.log('Added pgbouncer=true to DATABASE_URL');
}

const prisma = new PrismaClient();

async function main() {
  const email = 'superadmin@palkamtm.pl';
  
  console.log(`Checking user with email: ${email}`);

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    console.error(`User not found: ${email}`);
    process.exit(1);
  }

  console.log(`Found user: ${user.id}, current role: ${user.role}`);

  const updated = await prisma.user.update({
    where: { email },
    data: { role: 'ADMIN' },
  });

  console.log(`Updated user role to: ${updated.role}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
