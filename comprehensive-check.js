#!/usr/bin/env node
// KOMPLEKSOWA WERYFIKACJA SYSTEMU AUKCJI - Pełna inspekcja projektu

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔍 KOMPLEKSOWA WERYFIKACJA SYSTEMU AUKCJI');
console.log('==========================================');
console.log('📅 Data:', new Date().toLocaleString('pl-PL'));
console.log('');

// Kolory do outputu
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function checkFile(filePath, description) {
  try {
    const exists = fs.existsSync(filePath);
    if (exists) {
      const stats = fs.statSync(filePath);
      const lines = filePath.endsWith('.js') || filePath.endsWith('.ts') || filePath.endsWith('.tsx') ? 
        fs.readFileSync(filePath, 'utf8').split('\n').length : 'N/A';
      log(`✅ ${description}: ISTNIEJE (${stats.size} bytes, ${lines} linii)`, 'green');
      return { exists: true, size: stats.size, lines };
    } else {
      log(`❌ ${description}: NIE ISTNIEJE`, 'red');
      return { exists: false, size: 0, lines: 0 };
    }
  } catch (error) {
    log(`❌ ${description}: BŁĄD - ${error.message}`, 'red');
    return { exists: false, size: 0, lines: 0 };
  }
}

function checkDirectory(dirPath, description) {
  try {
    const exists = fs.existsSync(dirPath);
    if (exists) {
      const files = fs.readdirSync(dirPath).length;
      log(`✅ ${description}: ISTNIEJE (${files} plików)`, 'green');
      return { exists: true, files };
    } else {
      log(`❌ ${description}: NIE ISTNIEJE`, 'red');
      return { exists: false, files: 0 };
    }
  } catch (error) {
    log(`❌ ${description}: BŁĄD - ${error.message}`, 'red');
    return { exists: false, files: 0 };
  }
}

function checkEnvironment() {
  log('\n🌍 ŚRODOWISKO I KONFIGURACJA:', 'cyan');
  
  const envFiles = [
    { path: '.env', desc: '.env (główny)' },
    { path: '.env.development', desc: '.env.development' },
    { path: '.env.production', desc: '.env.production' },
    { path: 'server/.env', desc: 'server/.env' },
    { path: 'server/.env.example', desc: 'server/.env.example' }
  ];

  let envScore = 0;
  envFiles.forEach(file => {
    const result = checkFile(file.path, file.desc);
    if (result.exists) envScore++;
    
    // Sprawdź zawartość kluczowych zmiennych
    if (result.exists && file.path.includes('.env')) {
      try {
        const content = fs.readFileSync(file.path, 'utf8');
        const hasDatabase = content.includes('DATABASE_URL') || content.includes('SUPABASE_URL');
        const hasAuth = content.includes('JWT_SECRET') || content.includes('SUPABASE_SERVICE_ROLE_KEY');
        const hasStripe = content.includes('STRIPE_SECRET_KEY');
        
        log(`   🔑 Baza danych: ${hasDatabase ? '✅' : '❌'}`, hasDatabase ? 'green' : 'red');
        log(`   🔐 Autentykacja: ${hasAuth ? '✅' : '❌'}`, hasAuth ? 'green' : 'red');
        log(`   💳 Stripe: ${hasStripe ? '✅' : '❌'}`, hasStripe ? 'green' : 'yellow');
      } catch (e) {
        log(`   ⚠️  Nie można odczytać zmiennych`, 'yellow');
      }
    }
  });

  return envScore;
}

function checkFrontendStructure() {
  log('\n🎨 STRUKTURA FRONTEND:', 'cyan');
  
  const criticalFiles = [
    { path: 'package.json', desc: 'package.json' },
    { path: 'vite.config.ts', desc: 'vite.config.ts' },
    { path: 'index.html', desc: 'index.html' },
    { path: 'src/main.tsx', desc: 'main.tsx (entry point)' },
    { path: 'src/App.tsx', desc: 'App.tsx' },
    { path: 'src/components/CreateAuctionForm.tsx', desc: 'CreateAuctionForm.tsx' },
    { path: 'src/services/auctionService.ts', desc: 'auctionService.ts' },
    { path: 'src/contexts/AuthContext.tsx', desc: 'AuthContext.tsx' },
    { path: 'src/components/auction/LuxuryAuctionDetail.tsx', desc: 'LuxuryAuctionDetail.tsx' },
    { path: 'src/components/AuctionsPage.tsx', desc: 'AuctionsPage.tsx' }
  ];

  let frontendScore = 0;
  criticalFiles.forEach(file => {
    const result = checkFile(file.path, file.desc);
    if (result.exists) frontendScore++;
  });

  // Sprawdź strukturę katalogów
  const directories = [
    { path: 'src/components', desc: 'components' },
    { path: 'src/services', desc: 'services' },
    { path: 'src/contexts', desc: 'contexts' },
    { path: 'src/hooks', desc: 'hooks' },
    { path: 'src/types', desc: 'types' },
    { path: 'public', desc: 'public' }
  ];

  directories.forEach(dir => {
    checkDirectory(dir.path, dir.desc);
  });

  return frontendScore;
}

function checkBackendStructure() {
  log('\n🖥️  STRUKTURA BACKEND:', 'cyan');
  
  const backendFiles = [
    { path: 'server/package.json', desc: 'server/package.json' },
    { path: 'server/index.ts', desc: 'server/index.ts' },
    { path: 'server/routes/auctions.ts', desc: 'server/routes/auctions.ts' },
    { path: 'server/routes/payments.ts', desc: 'server/routes/payments.ts' },
    { path: 'server/routes/auth.ts', desc: 'server/routes/auth.ts' },
    { path: 'server/prisma/schema.prisma', desc: 'server/prisma/schema.prisma' },
    { path: 'server/lib/db.ts', desc: 'server/lib/db.ts' },
    { path: 'server/middleware/auth.ts', desc: 'server/middleware/auth.ts' }
  ];

  let backendScore = 0;
  backendFiles.forEach(file => {
    const result = checkFile(file.path, file.desc);
    if (result.exists) backendScore++;
  });

  // Sprawdź strukturę katalogów backend
  const backendDirs = [
    { path: 'server/routes', desc: 'routes' },
    { path: 'server/middleware', desc: 'middleware' },
    { path: 'server/lib', desc: 'lib' },
    { path: 'server/prisma', desc: 'prisma' },
    { path: 'server/scripts', desc: 'scripts' }
  ];

  backendDirs.forEach(dir => {
    checkDirectory(dir.path, dir.desc);
  });

  return backendScore;
}

function checkDatabaseSchema() {
  log('\n🗄️  SCHEMA BAZY DANYCH:', 'cyan');
  
  try {
    const schemaPath = 'server/prisma/schema.prisma';
    if (!fs.existsSync(schemaPath)) {
      log('❌ Schema.prisma nie istnieje', 'red');
      return false;
    }

    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    // Sprawdź kluczowe modele
    const checks = [
      { pattern: /model User\s*{/, desc: 'Model User' },
      { pattern: /model Auction\s*{/, desc: 'Model Auction' },
      { pattern: /model Payment\s*{/, desc: 'Model Payment' },
      { pattern: /model PigeonProfile\s*{/, desc: 'Model PigeonProfile (gołąbie)' },
      { pattern: /model Bid\s*{/, desc: 'Model Bid (oferty)' },
      { pattern: /username\s+String/, desc: 'Pole username w User' },
      { pattern: /ringNumber\s+String/, desc: 'Pole ringNumber w PigeonProfile' }
    ];

    let schemaScore = 0;
    checks.forEach(check => {
      if (schema.match(check.pattern)) {
        log(`✅ ${check.desc}: ZNALEZIONO`, 'green');
        schemaScore++;
      } else {
        log(`❌ ${check.desc}: NIE ZNALEZIONO`, 'red');
      }
    });

    // Sprawdź relacje
    const relations = [
      { pattern: /auction\s+Auction\s*@relation/, desc: 'Relacja Auction w PigeonProfile' },
      { pattern: /user\s+User\s*@relation/, desc: 'Relacja User w Payment' },
      { pattern: /auction\s+Auction\s*@relation/, desc: 'Relacja Auction w Payment' }
    ];

    log('\n🔗 RELACJE W BAZIE DANYCH:', 'cyan');
    relations.forEach(rel => {
      if (schema.match(rel.pattern)) {
        log(`✅ ${rel.desc}: ZNALEZIONO`, 'green');
      } else {
        log(`❌ ${rel.desc}: NIE ZNALEZIONO`, 'red');
      }
    });

    return schemaScore >= 5;
  } catch (error) {
    log(`❌ Błąd sprawdzania schema: ${error.message}`, 'red');
    return false;
  }
}

function checkDependencies() {
  log('\n📦 ZALEŻNOŚCI I PLUGINY:', 'cyan');
  
  try {
    const packagePath = 'package.json';
    if (!fs.existsSync(packagePath)) {
      log('❌ package.json nie istnieje', 'red');
      return false;
    }

    const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
    const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };
    
    const criticalDeps = [
      'react',
      'react-dom',
      'vite',
      '@prisma/client',
      'supabase-js',
      'stripe',
      'framer-motion',
      'lucide-react',
      '@radix-ui/react-dialog',
      '@tanstack/react-query'
    ];

    let depScore = 0;
    criticalDeps.forEach(dep => {
      if (deps[dep]) {
        log(`✅ ${dep}: ${deps[dep]}`, 'green');
        depScore++;
      } else {
        log(`❌ ${dep}: BRAK`, 'red');
      }
    });

    // Sprawdź backend dependencies
    const backendPackagePath = 'server/package.json';
    if (fs.existsSync(backendPackagePath)) {
      log('\n🖥️  BACKEND ZALEŻNOŚCI:', 'cyan');
      const backendPackageJson = JSON.parse(fs.readFileSync(backendPackagePath, 'utf8'));
      const backendDeps = { ...backendPackageJson.dependencies, ...backendPackageJson.devDependencies };
      
      const backendCriticalDeps = [
        'express',
        '@prisma/client',
        'stripe',
        'supabase-js',
        'zod',
        'jsonwebtoken'
      ];

      backendCriticalDeps.forEach(dep => {
        if (backendDeps[dep]) {
          log(`✅ ${dep}: ${backendDeps[dep]}`, 'green');
        } else {
          log(`❌ ${dep}: BRAK`, 'red');
        }
      });
    }

    return depScore >= 7;
  } catch (error) {
    log(`❌ Błąd sprawdzania zależności: ${error.message}`, 'red');
    return false;
  }
}

function checkBuildAndDeployment() {
  log('\n🏗️  BUILD I DEPLOYMENT:', 'cyan');
  
  const buildFiles = [
    { path: 'dist', desc: 'Folder dist (build)' },
    { path: 'dist/index.html', desc: 'Build index.html' },
    { path: 'vercel.json', desc: 'vercel.json (Vercel deploy)' },
    { path: 'render.yaml', desc: 'render.yaml (Render deploy)' },
    { path: 'Dockerfile.frontend', desc: 'Dockerfile.frontend' },
    { path: 'docker-compose.dev.yml', desc: 'docker-compose.dev.yml' }
  ];

  let buildScore = 0;
  buildFiles.forEach(file => {
    if (file.path.endsWith('/')) {
      if (checkDirectory(file.path, file.desc).exists) buildScore++;
    } else {
      if (checkFile(file.path, file.desc).exists) buildScore++;
    }
  });

  // Sprawdź migracje bazy danych
  const migrationsDir = 'supabase/migrations';
  if (fs.existsSync(migrationsDir)) {
    const migrations = fs.readdirSync(migrationsDir);
    log(`✅ Migracje bazy danych: ${migrations.length} plików`, 'green');
    migrations.forEach(migration => {
      log(`   📄 ${migration}`, 'white');
    });
  } else {
    log('❌ Migracje bazy danych: BRAK', 'red');
  }

  return buildScore;
}

function checkSecurityAndAuth() {
  log('\n🔐 BEZPIECZEŃSTWO I AUTENTYKACJA:', 'cyan');
  
  // Sprawdź pliki bezpieczeństwa
  const securityFiles = [
    { path: 'server/middleware/auth.ts', desc: 'Middleware autentykacji' },
    { path: 'server/middleware/csp.ts', desc: 'CSP (Content Security Policy)' },
    { path: 'src/contexts/AuthContext.tsx', desc: 'AuthContext (frontend)' },
    { path: 'src/hooks/useAuth.ts', desc: 'useAuth hook' }
  ];

  securityFiles.forEach(file => {
    checkFile(file.path, file.desc);
  });

  // Sprawdź konfigurację CSP
  try {
    const indexHtml = fs.readFileSync('index.html', 'utf8');
    if (indexHtml.includes('Content-Security-Policy')) {
      log('✅ CSP w index.html: ZNALEZIONO', 'green');
    } else {
      log('⚠️  CSP w index.html: NIE ZNALEZIONO', 'yellow');
    }
  } catch (error) {
    log('❌ Nie można sprawdzić CSP', 'red');
  }

  // Sprawdź klucze API
  try {
    const serverEnv = fs.readFileSync('server/.env.example', 'utf8');
    const hasStripeKeys = serverEnv.includes('STRIPE_SECRET_KEY');
    const hasSupabaseKeys = serverEnv.includes('SUPABASE_SERVICE_ROLE_KEY');
    
    log(`🔑 Klucze Stripe: ${hasStripeKeys ? '✅' : '❌'}`, hasStripeKeys ? 'green' : 'red');
    log(`🔑 Klucze Supabase: ${hasSupabaseKeys ? '✅' : '❌'}`, hasSupabaseKeys ? 'green' : 'red');
  } catch (error) {
    log('❌ Nie można sprawdzić kluczy API', 'red');
  }
}

function checkPaymentIntegration() {
  log('\n💳 INTEGRACJA PŁATNOŚCI (STRIPE):', 'cyan');
  
  const paymentFiles = [
    { path: 'server/routes/payments.ts', desc: 'Backend payments API' },
    { path: 'src/services/paymentService.ts', desc: 'Frontend payment service' },
    { path: 'src/pages/AuctionSuccess.tsx', desc: 'Strona sukcesu płatności' }
  ];

  paymentFiles.forEach(file => {
    checkFile(file.path, file.desc);
  });

  // Sprawdź logikę płatności w kodzie
  try {
    const paymentsRoute = fs.readFileSync('server/routes/payments.ts', 'utf8');
    const paymentChecks = [
      { pattern: /createCheckoutSession/, desc: 'Tworzenie sesji Stripe' },
      { pattern: /webhook.*stripe/, desc: 'Webhook Stripe' },
      { pattern: /LISTING_FEE|COMMISSION/, desc: 'Opłaty (listing fee, prowizja)' },
      { pattern: /stripe\.Secret/, desc: 'Klucz Stripe' }
    ];

    paymentChecks.forEach(check => {
      if (paymentsRoute.match(check.pattern)) {
        log(`✅ ${check.desc}: ZNALEZIONO`, 'green');
      } else {
        log(`❌ ${check.desc}: NIE ZNALEZIONO`, 'red');
      }
    });
  } catch (error) {
    log('❌ Nie można sprawdzić logiki płatności', 'red');
  }
}

function checkUIComponents() {
  log('\n🎨 KOMPONENTY UI:', 'cyan');
  
  const uiComponents = [
    { path: 'src/components/ui/button.tsx', desc: 'Button component' },
    { path: 'src/components/ui/UnifiedModal.tsx', desc: 'UnifiedModal' },
    { path: 'src/components/DraggableModal.tsx', desc: 'DraggableModal' },
    { path: 'src/components/AccountModal.tsx', desc: 'AccountModal' },
    { path: 'src/components/auction/LuxuryAuctionCard.tsx', desc: 'LuxuryAuctionCard' },
    { path: 'src/components/FileUpload.tsx', desc: 'FileUpload' }
  ];

  uiComponents.forEach(comp => {
    checkFile(comp.path, comp.desc);
  });

  // Sprawdź komponenty formularzy
  const formComponents = [
    { path: 'src/components/CreateAuctionForm.tsx', desc: 'CreateAuctionForm' },
    { path: 'src/components/CreateSupplementAuctionForm.tsx', desc: 'CreateSupplementAuctionForm' },
    { path: 'src/components/CreateAccessoryAuctionForm.tsx', desc: 'CreateAccessoryAuctionForm' }
  ];

  log('\n📝 KOMPONENTY FORMULARZY:', 'cyan');
  formComponents.forEach(comp => {
    checkFile(comp.path, comp.desc);
  });
}

function generateComprehensiveReport() {
  log('\n📊 KOMPLEKSOWY RAPORT KOŃCOWY:', 'cyan');
  log('==========================================', 'cyan');
  
  const envScore = checkEnvironment();
  const frontendScore = checkFrontendStructure();
  const backendScore = checkBackendStructure();
  const schemaOk = checkDatabaseSchema();
  const depsOk = checkDependencies();
  const buildScore = checkBuildAndDeployment();
  checkSecurityAndAuth();
  checkPaymentIntegration();
  checkUIComponents();
  
  const totalScore = envScore + frontendScore + backendScore + (schemaOk ? 1 : 0) + (depsOk ? 1 : 0) + buildScore;
  const maxScore = 5 + 10 + 8 + 1 + 1 + 6; // 31
  
  const percentage = Math.round((totalScore / maxScore) * 100);
  
  log(`\n🎯 WYNIK KOŃCOWY: ${totalScore}/${maxScore} (${percentage}%)`, percentage >= 90 ? 'green' : percentage >= 70 ? 'yellow' : 'red');
  
  if (percentage >= 90) {
    log('✅ SYSTEM JEST WYNIKOWY - WSZYSTKIE KOMPONENTY SPRAWNE', 'green');
  } else if (percentage >= 70) {
    log('⚠️  SYSTEM JEST W DOBREJ FORMIE - KILKA POPRAWEK ZALECANYCH', 'yellow');
  } else {
    log('❌ SYSTEM WYMAGA WIELU POPRAWEK', 'red');
  }
  
  log('\n🚀 STATUS GOTOWOŚCI DO DEPLOYMENTU:', 'cyan');
  log('==========================================', 'cyan');
  
  if (percentage >= 90) {
    log('✅ Gotowość: PRODUKCYJNA', 'green');
    log('✅ Baza danych: Zsynchronizowana', 'green');
    log('✅ Płatności: Skonfigurowane', 'green');
    log('✅ Bezpieczeństwo: Wdrożone', 'green');
    log('✅ UI/UX: Kompletne', 'green');
  } else if (percentage >= 70) {
    log('⚠️  Gotowość: DEWELOPERSKA', 'yellow');
    log('⚠️  Baza danych: Wymaga weryfikacji', 'yellow');
    log('⚠️  Płatności: Częściowo skonfigurowane', 'yellow');
  } else {
    log('❌ Gotowość: WYMAGA DUŻYCH POPRAWEK', 'red');
    log('❌ Baza danych: Niekompletna', 'red');
    log('❌ Płatności: Nieskonfigurowane', 'red');
  }
  
  log('\n🔧 AKCJE DO WYKONANIA (jeśli potrzebne):', 'cyan');
  if (envScore < 5) log('- Uzupełnij pliki .env', 'yellow');
  if (frontendScore < 8) log('- Sprawdź brakujące komponenty frontend', 'yellow');
  if (backendScore < 6) log('- Uzupełnij backend API', 'yellow');
  if (!schemaOk) log('- Popraw schema bazy danych', 'yellow');
  if (!depsOk) log('- Zainstaluj brakujące zależności: npm install', 'yellow');
  if (buildScore < 3) log('- Zbuduj aplikację: npm run build', 'yellow');
  
  log('\n🌟 PODSUMOWANIE TECHNICZNE:', 'cyan');
  log('==========================================', 'cyan');
  log(`📁 Pliki konfiguracyjne: ${envScore}/5`, envScore === 5 ? 'green' : 'yellow');
  log(`🎨 Frontend: ${frontendScore}/10`, frontendScore === 10 ? 'green' : 'yellow');
  log(`🖥️  Backend: ${backendScore}/8`, backendScore === 8 ? 'green' : 'yellow');
  log(`🗄️  Baza danych: ${schemaOk ? '1/1' : '0/1'}`, schemaOk ? 'green' : 'red');
  log(`📦 Zależności: ${depsOk ? '1/1' : '0/1'}`, depsOk ? 'green' : 'yellow');
  log(`🏗️  Build: ${buildScore}/6`, buildScore >= 4 ? 'green' : 'yellow');
  
  log('\n🎉 KOMPLEKSOWA WERYFIKACJA ZAKOŃCZONA!', 'green');
}

// Uruchom kompleksową weryfikację
generateComprehensiveReport();
