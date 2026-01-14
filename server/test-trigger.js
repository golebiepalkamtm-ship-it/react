import { PrismaClient } from '@prisma/client';
import { createClient } from '@supabase/supabase-js';

const prisma = new PrismaClient();
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testTrigger() {
  try {
    console.log('Testing user creation trigger...\n');

    // 1. Check current users count
    const beforeCount = await prisma.user.count();
    console.log(`Users before test: ${beforeCount}`);

    // 2. Create auth user directly (this should trigger user creation)
    const testEmail = `trigger-test-${Date.now()}@example.com`;
    console.log(`Creating auth user: ${testEmail}`);
    
    const { data: authUser, error: createError } = await supabase.auth.admin.createUser({
      email: testEmail,
      password: 'testpassword123',
      email_confirm: false
    });

    if (createError) {
      console.error('Error creating auth user:', createError);
      return;
    }

    console.log(`Auth user created: ${authUser.user.id}`);

    // 3. Wait a moment for trigger to execute
    await new Promise(resolve => setTimeout(resolve, 2000));

    // 4. Check if user was created in public.users
    const publicUser = await prisma.user.findUnique({
      where: { id: authUser.user.id }
    });

    if (publicUser) {
      console.log('✅ SUCCESS: User created in public.users!');
      console.log(`ID: ${publicUser.id}`);
      console.log(`Email: ${publicUser.email}`);
      console.log(`Role: ${publicUser.role}`);
      console.log(`Created: ${publicUser.created_at}`);
      
      // Test email confirmation
      console.log('\nTesting email confirmation...');
      const { error: confirmError } = await supabase.auth.admin.updateUserById(
        authUser.user.id,
        { email_confirm: true }
      );

      if (confirmError) {
        console.error('Error confirming email:', confirmError);
      } else {
        await new Promise(resolve => setTimeout(resolve, 1000));
        const confirmedUser = await prisma.user.findUnique({
          where: { id: authUser.user.id }
        });
        
        if (confirmedUser && confirmedUser.role === 'USER_EMAIL_VERIFIED') {
          console.log('✅ Email confirmation trigger working!');
          console.log(`New role: ${confirmedUser.role}`);
        } else {
          console.log('❌ Email confirmation trigger not working');
        }
      }

    } else {
      console.log('❌ FAILURE: User NOT created in public.users');
      console.log('Trigger is not working!');
      
      // Check if trigger exists
      const triggers = await prisma.$queryRaw`
        SELECT tgname as trigger_name, tgrelid::regclass as table_name
        FROM pg_trigger 
        WHERE tgname LIKE '%auth_user%' 
        ORDER BY table_name
      `;
      console.log('Existing triggers:', triggers);
    }

    // 5. Cleanup
    console.log('\nCleaning up...');
    if (publicUser) {
      await prisma.user.delete({ where: { id: authUser.user.id } });
    }
    await supabase.auth.admin.deleteUser(authUser.user.id);
    
    const afterCount = await prisma.user.count();
    console.log(`Users after cleanup: ${afterCount}`);

  } catch (error) {
    console.error('Test failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testTrigger();
