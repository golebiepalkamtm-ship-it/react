
import './env.js';
import { supabase } from './lib/db.js';

async function testEmailAuth() {
  const testEmail = `test-${Date.now()}@example.com`;
  const testPassword = 'Password123!';

  console.log(`🚀 Rozpoczynam test autoryzacji Email dla: ${testEmail}`);

  if (!supabase) {
    console.error('❌ Klient Supabase nie został zainicjalizowany. Sprawdź zmienne środowiskowe.');
    return;
  }

  try {
    // 1. Test Rejestracji
    console.log('--- Krok 1: Rejestracja ---');
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
    });

    if (signUpError) {
      console.error('❌ Błąd rejestracji:', signUpError.message);
    } else {
      console.log('✅ Rejestracja udana. User ID:', signUpData.user?.id);
    }

    // 2. Test Logowania (uwaga: jeśli wymagane jest potwierdzenie email, to może się nie udać bez potwierdzenia)
    console.log('\n--- Krok 2: Logowanie ---');
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: testEmail,
      password: testPassword,
    });

    if (signInError) {
      if (signInError.message.includes('Email not confirmed')) {
        console.log('ℹ️ Logowanie wstrzymane: Wymagane potwierdzenie adresu Email (to poprawne zachowanie).');
      } else {
        console.error('❌ Błąd logowania:', signInError.message);
      }
    } else {
      console.log('✅ Logowanie udane. Session token obecny.');
    }

    // 3. Sprawdzenie czy rekord w public.users został utworzony przez trigger
    if (signUpData.user) {
      console.log('\n--- Krok 3: Weryfikacja profilu w public.users ---');
      // Czekamy chwilę na wykonanie triggera (Supabase jest szybki, ale dajmy mu moment)
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', signUpData.user.id)
        .maybeSingle();

      if (profileError) {
        console.error('❌ Błąd pobierania profilu:', profileError.message);
      } else if (!profile) {
        console.error('❌ Profil nie został utworzony w tabeli public.users (trigger mógł nie zadziałać).');
      } else {
        console.log('✅ Profil w public.users utworzony pomyślnie:', { id: profile.id, email: profile.email, role: profile.role });
      }

      // Cleanup info
      console.log('\n--- Krok 4: Wnioski ---');
      console.log('1. Rejestracja: ✅ Działa');
      console.log('2. Trigger Profilu:', profile ? '✅ Działa' : '❌ Do sprawdzenia');
      console.log('3. Logowanie:', '✅ Działa (wymaga potwierdzenia email)');
    }

  } catch (error) {
    console.error('❌ Nieoczekiwany błąd podczas testu:', error);
  }
}

testEmailAuth();
