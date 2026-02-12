import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkRealSchema() {
  try {
    console.log('Checking real database schema...\n');

    // Get actual table structure
    const tableStructure = await prisma.$queryRaw`
      SELECT 
        column_name, 
        data_type, 
        is_nullable,
        column_default
      FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'users'
      ORDER BY ordinal_position
    `;
    
    console.log('Actual users table structure:');
    console.table(tableStructure);

    // Check if table exists at all
    const tableExists = await prisma.$queryRaw`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'users'
      );
    `;
    
    console.log('\nTable exists:', tableExists[0].exists);

    // Try to select a sample user to see what columns are actually available
    try {
      const sampleUser = await prisma.$queryRaw`SELECT * FROM public.users LIMIT 1`;
      if (sampleUser.length > 0) {
        console.log('\nSample user columns:', Object.keys(sampleUser[0]));
        console.log('Sample user data:', sampleUser[0]);
      } else {
        console.log('\nNo users in table');
      }
    } catch (error) {
      console.error('Error selecting sample user:', error.message);
    }

  } catch (error) {
    console.error('Schema check failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkRealSchema();
