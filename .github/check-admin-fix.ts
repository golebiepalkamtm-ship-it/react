import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function checkAdmin() {
  try {
    const users = await prisma.user.findMany({
      where: {
        email: {
          contains: 'palka'
        }
      },
      select: {
        id: true,
        email: true,
        role: true,
        name: true
      }
    });
    
    console.log('UĹĽytkownicy z palka w emailu:');
    console.log(users);
    
    // ZnajdĹş Twoje konto
    const yourAccount = users.find(u => u.email && u.email.includes('superadmin@palkamtm.pl'));
    if (yourAccount) {
      console.log(`\nTwoje konto: ${yourAccount.email}`);
      console.log(`Aktualna rola: ${yourAccount.role}`);
      
      if (yourAccount.role !== 'ADMIN') {
        console.log('Zmieniam rolÄ™ na ADMIN...');
        await prisma.user.update({
          where: { id: yourAccount.id },
          data: { role: 'ADMIN' }
        });
        console.log('Rola zmieniona na ADMIN!');
      }
    } else {
      console.log('Nie znaleziono konta superadmin@palkamtm.pl');
      console.log('Wszyscy uĹĽytkownicy:');
      const allUsers = await prisma.user.findMany({
        select: {
          id: true,
          email: true,
          role: true,
          name: true
        },
        take: 10
      });
      console.log(allUsers);
    }
  } catch (error) {
    console.error('BĹ‚Ä…d:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkAdmin();

