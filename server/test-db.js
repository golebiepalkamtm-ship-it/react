import { PrismaClient } from '@prisma/client';
import { createClient } from '@supabase/supabase-js';

const prisma = new PrismaClient();
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testUserCreation() {
  try {
    console.log('Testing user creation and verification...\n');

    // 1. Check current users
    const currentUsers = await prisma.user.count();
    console.log(`Current users in database: ${currentUsers}`);

    // 2. Check auth users
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
    if (authError) throw authError;
    console.log(`Auth users: ${authUsers.users.length}`);

    // 3. Check triggers
    const triggers = await prisma.$queryRaw`
      SELECT tgname as trigger_name, tgrelid::regclass as table_name
      FROM pg_trigger 
      WHERE tgname LIKE '%auth_user%' 
      ORDER BY table_name
    `;
    console.log('Triggers:', triggers);

    // 4. Test creating a new user via auth
    const testEmail = `test-${Date.now()}@example.com`;
    console.log(`\nCreating test user: ${testEmail}`);
    
    const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
      email: testEmail,
      password: 'testpassword123',
      email_confirm: false
    });

    if (createError) {
      console.error('Error creating user:', createError);
      return;
    }

    console.log(`User created with ID: ${newUser.user.id}`);

    // 5. Check if user was created in public.users
    await new Promise(resolve => setTimeout(resolve, 1000)); // Wait for trigger
    
    const publicUser = await prisma.user.findUnique({
      where: { id: newUser.user.id }
    });

    if (publicUser) {
      console.log('✅ User successfully created in public.users');
      console.log(`Role: ${publicUser.role}`);
    } else {
      console.log('❌ User NOT found in public.users - trigger issue!');
    }

    // 6. Test email confirmation
    console.log('\nTesting email confirmation...');
    const { error: confirmError } = await supabase.auth.admin.updateUserById(
      newUser.user.id,
      { email_confirm: true }
    );

    if (confirmError) {
      console.error('Error confirming email:', confirmError);
    } else {
      console.log('Email confirmed');
      
      // Check role update
      await new Promise(resolve => setTimeout(resolve, 1000));
      const updatedUser = await prisma.user.findUnique({
        where: { id: newUser.user.id }
      });
      
      if (updatedUser) {
        console.log(`Updated role: ${updatedUser.role}`);
      }
    }

    // 7. Test SMS verification setup
    console.log('\nTesting phone verification...');
    const { error: phoneError } = await supabase.auth.admin.updateUserById(
      newUser.user.id,
      { 
        phone: '+48123456789',
        phone_confirm: true 
      }
    );

    if (phoneError) {
      console.error('Error confirming phone:', phoneError);
    } else {
      console.log('Phone confirmed');
      
      // Check final role
      await new Promise(resolve => setTimeout(resolve, 1000));
      const finalUser = await prisma.user.findUnique({
        where: { id: newUser.user.id }
      });
      
      if (finalUser) {
        console.log(`Final role: ${finalUser.role}`);
        console.log('✅ Full verification flow working!');
      }
    }

    // Cleanup
    await prisma.user.delete({ where: { id: newUser.user.id } });
    await supabase.auth.admin.deleteUser(newUser.user.id);
    console.log('\n🧹 Test user cleaned up');

  } catch (error) {
    console.error('Test failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testUserCreation();
