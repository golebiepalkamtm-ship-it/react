import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function simpleTest() {
  try {
    console.log('Testing database connection...\n');

    // 1. Check current users
    const currentUsers = await prisma.user.count();
    console.log(`Current users in database: ${currentUsers}`);

    // 2. Check table structure
    const tableInfo = await prisma.$queryRaw`
      SELECT column_name, data_type, column_default 
      FROM information_schema.columns 
      WHERE table_name = 'users' 
      ORDER BY column_name
    `;
    console.log('\nTable structure:');
    console.table(tableInfo);

    // 3. Try to create a test user directly
    const testId = crypto.randomUUID();
    console.log(`\nTrying to create test user with ID: ${testId}`);
    
    try {
      const newUser = await prisma.user.create({
        data: {
          id: testId,
          email: `test-${Date.now()}@example.com`,
          role: 'USER_REGISTERED'
        }
      });
      console.log('✅ User created successfully!');
      console.log(`ID: ${newUser.id}, Role: ${newUser.role}`);
      
      // Clean up
      await prisma.user.delete({ where: { id: testId } });
      console.log('🧹 Test user cleaned up');
      
    } catch (error) {
      console.error('❌ Error creating user:', error.message);
    }

  } catch (error) {
    console.error('Test failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

simpleTest();
