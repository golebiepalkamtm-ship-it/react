#!/usr/bin/env node
// Diagnostyka systemu aukcji - skrypt sprawdzający wszystkie krytyczne komponenty

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔍 DIAGNOSTYKA SYSTEMU AUKCJI');
console.log('=====================================\n');

// Kolory do outputu
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function checkFile(filePath, description) {
  try {
    const exists = fs.existsSync(filePath);
    if (exists) {
      const stats = fs.statSync(filePath);
      log(`✅ ${description}: ISTNIEJE (${stats.size} bytes)`, 'green');
      return true;
    } else {
      log(`❌ ${description}: NIE ISTNIEJE`, 'red');
      return false;
    }
  } catch (error) {
    log(`❌ ${description}: BŁĄD - ${error.message}`, 'red');
    return false;
  }
}

function checkDirectory(dirPath, description) {
  try {
    const exists = fs.existsSync(dirPath);
    if (exists) {
      const files = fs.readdirSync(dirPath).length;
      log(`✅ ${description}: ISTNIEJE (${files} plików)`, 'green');
      return true;
    } else {
      log(`❌ ${description}: NIE ISTNIEJE`, 'red');
      return false;
    }
  } catch (error) {
    log(`❌ ${description}: BŁĄD - ${error.message}`, 'red');
    return false;
  }
}

function checkEnvFile() {
  log('\n📁 PLIKI KONFIGURACYJNE:', 'cyan');
  
  const envFiles = [
    { path: '.env', desc: '.env (główny)' },
    { path: '.env.development', desc: '.env.development' },
    { path: '.env.production', desc: '.env.production' },
    { path: 'server/.env', desc: 'server/.env' },
    { path: 'server/.env.example', desc: 'server/.env.example' }
  ];

  let envScore = 0;
  envFiles.forEach(file => {
    if (checkFile(file.path, file.desc)) envScore++;
  });

  if (envScore < 3) {
    log('⚠️  OSTRZEŻENIE: Brakuje plików .env!', 'yellow');
  }

  return envScore;
}

function checkCriticalFiles() {
  log('\n📄 KLUCZOWE PLIKI FRONTEND:', 'cyan');
  
  const criticalFiles = [
    { path: 'package.json', desc: 'package.json' },
    { path: 'vite.config.ts', desc: 'vite.config.ts' },
    { path: 'index.html', desc: 'index.html' },
    { path: 'src/main.tsx', desc: 'main.tsx (entry point)' },
    { path: 'src/App.tsx', desc: 'App.tsx' },
    { path: 'src/components/CreateAuctionForm.tsx', desc: 'CreateAuctionForm.tsx' },
    { path: 'src/services/auctionService.ts', desc: 'auctionService.ts' },
    { path: 'src/contexts/AuthContext.tsx', desc: 'AuthContext.tsx' }
  ];

  let frontendScore = 0;
  criticalFiles.forEach(file => {
    if (checkFile(file.path, file.desc)) frontendScore++;
  });

  return frontendScore;
}

function checkBackendFiles() {
  log('\n🖥️  KLUCZOWE PLIKI BACKEND:', 'cyan');
  
  const backendFiles = [
    { path: 'server/package.json', desc: 'server/package.json' },
    { path: 'server/index.ts', desc: 'server/index.ts' },
    { path: 'server/routes/auctions.ts', desc: 'server/routes/auctions.ts' },
    { path: 'server/routes/payments.ts', desc: 'server/routes/payments.ts' },
    { path: 'server/prisma/schema.prisma', desc: 'server/prisma/schema.prisma' },
    { path: 'server/lib/db.ts', desc: 'server/lib/db.ts' }
  ];

  let backendScore = 0;
  backendFiles.forEach(file => {
    if (checkFile(file.path, file.desc)) backendScore++;
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
      { pattern: /username\s+String/, desc: 'Pole username w User' }
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

    return schemaScore >= 4;
  } catch (error) {
    log(`❌ Błąd sprawdzania schema: ${error.message}`, 'red');
    return false;
  }
}

function checkDependencies() {
  log('\n📦 ZALEŻNOŚCI:', 'cyan');
  
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
      'framer-motion'
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

    return depScore >= 5;
  } catch (error) {
    log(`❌ Błąd sprawdzania zależności: ${error.message}`, 'red');
    return false;
  }
}

function checkBuildFiles() {
  log('\n🏗️  PLIKI BUILD:', 'cyan');
  
  const buildFiles = [
    { path: 'dist', desc: 'Folder dist (build)' },
    { path: 'dist/index.html', desc: 'Build index.html' }
  ];

  let buildScore = 0;
  buildFiles.forEach(file => {
    if (file.path.endsWith('/')) {
      if (checkDirectory(file.path, file.desc)) buildScore++;
    } else {
      if (checkFile(file.path, file.desc)) buildScore++;
    }
  });

  return buildScore;
}

function checkShareModal() {
  log('\n🔗 SHARE MODAL:', 'cyan');
  
  const shareModalPath = 'public/share-modal.v4.js';
  if (checkFile(shareModalPath, 'share-modal.v4.js')) {
    try {
      const content = fs.readFileSync(shareModalPath, 'utf8');
      
      if (content.includes('addEventListener')) {
        log('✅ addEventListener: ZNALEZIONO', 'green');
      } else {
        log('❌ addEventListener: NIE ZNALEZIONO', 'red');
        return false;
      }

      if (content.includes('DOMContentLoaded')) {
        log('✅ DOMContentLoaded: ZNALEZIONO', 'green');
      } else {
        log('⚠️  DOMContentLoaded: NIE ZNALEZIONO', 'yellow');
      }

      return true;
    } catch (error) {
      log(`❌ Błąd sprawdzania share-modal: ${error.message}`, 'red');
      return false;
    }
  }
  return false;
}

function generateReport() {
  log('\n📊 RAPORT KOŃCOWY:', 'cyan');
  log('=====================================', 'cyan');
  
  const envScore = checkEnvFile();
  const frontendScore = checkCriticalFiles();
  const backendScore = checkBackendFiles();
  const schemaOk = checkDatabaseSchema();
  const depsOk = checkDependencies();
  const buildScore = checkBuildFiles();
  const shareModalOk = checkShareModal();
  
  const totalScore = envScore + frontendScore + backendScore + (schemaOk ? 1 : 0) + (depsOk ? 1 : 0) + buildScore + (shareModalOk ? 1 : 0);
  const maxScore = 5 + 8 + 6 + 1 + 1 + 2 + 1; // 24
  
  const percentage = Math.round((totalScore / maxScore) * 100);
  
  log(`\n🎯 WYNIK: ${totalScore}/${maxScore} (${percentage}%)`, percentage >= 80 ? 'green' : percentage >= 60 ? 'yellow' : 'red');
  
  if (percentage >= 80) {
    log('✅ SYSTEM JEST W DOBREJ FORMIE', 'green');
  } else if (percentage >= 60) {
    log('⚠️  SYSTEM WYMAGA KILKU POPRAWEK', 'yellow');
  } else {
    log('❌ SYSTEM MA POWAŻNE PROBLEMY', 'red');
  }
  
  log('\n🔧 REKOMENDACJE:', 'cyan');
  
  if (envScore < 3) log('- Uzupełnij pliki .env', 'yellow');
  if (frontendScore < 6) log('- Sprawdź kluczowe pliki frontend', 'yellow');
  if (backendScore < 4) log('- Sprawdź pliki backend', 'yellow');
  if (!schemaOk) log('- Popraw schema bazy danych', 'yellow');
  if (!depsOk) log('- Zainstaluj brakujące zależności', 'yellow');
  if (buildScore < 1) log('- Zbuduj aplikację (npm run build)', 'yellow');
  if (!shareModalOk) log('- Napraw share-modal.js', 'yellow');
  
  log('\n🚀 AKCJE DO WYKONANIA:', 'cyan');
  log('1. npm install (jeśli brakuje zależności)', 'white');
  log('2. npm run build (jeśli brakuje build)', 'white');
  log('3. npm run dev (uruchom development)', 'white');
  log('4. Sprawdź konsolę przeglądarki pod kątem błędów', 'white');
}

// Uruchom diagnostykę
generateReport();
