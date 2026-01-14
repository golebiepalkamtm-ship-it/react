
import './env.js';
import { smsService } from './lib/sms.js';

async function testSMS() {
  const testPhone = process.env.TEST_PHONE_NUMBER || '+48123456789'; // Zmień na swój numer w .env lub tutaj
  console.log(`🚀 Rozpoczynam test SMS dla numeru: ${testPhone}`);
  
  try {
    // 1. Test wysyłania kodu weryfikacyjnego
    console.log('--- Test 1: Wysyłanie kodu weryfikacyjnego ---');
    const sent = await smsService.sendVerificationCode(testPhone);
    console.log('Status wysyłki:', sent ? '✅ Wysłano' : '❌ Błąd (Sprawdź konsolę)');

    // 2. Test powiadomienia o aukcji
    console.log('\n--- Test 2: Wysyłanie powiadomienia o wygranej ---');
    const notified = await smsService.sendAuctionWonNotification(
      testPhone, 
      'Testowa Aukcja Gołębia', 
      1500,
      { name: 'Jan Kowalski', phone: '+48987654321' }
    );
    console.log('Status powiadomienia:', notified ? '✅ Wysłano' : '❌ Błąd');

  } catch (error) {
    console.error('❌ Błąd podczas testu SMS:', error);
  }
}

testSMS();
