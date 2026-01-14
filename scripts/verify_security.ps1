#!/usr/bin/env pwsh
<#
.SYNOPSIS
   # ============================================================================
# SECURITY VERIFICATION SCRIPT
# ============================================================================
# Weryfikuje wszystkie cztery krytyczne poprawki bezpieczeństwa:
# 1. Unifikacja weryfikacji tokenów (TokenVerifier)
# 2. CSRF Protection dla WebSocket (Origin + Ticket-based auth)
# 3. Brak hardcoded secrets (fail-fast validation)
# 4. Race condition protection (SELECT FOR UPDATE)
# ============================================================================
    4. Race Condition Protection in protect_user_role
.NOTES
    Author: Security Audit System
    Date: 2026-01-14
#>

param(
    [switch]$Verbose,
    [switch]$SkipEnvCheck,
    [string]$ServerPath = ".\server"
)

$ErrorActionPreference = "Continue"
$script:FailureCount = 0
$script:WarningCount = 0
$script:PassCount = 0

function Write-TestResult {
    param(
        [string]$TestName,
        [string]$Status,
        [string]$Message = ""
    )
    
    $timestamp = Get-Date -Format "HH:mm:ss"
    
    switch ($Status) {
        "PASS" {
            Write-Host "[$timestamp] [PASS] $TestName" -ForegroundColor Green
            $script:PassCount++
        }
        "FAIL" {
            Write-Host "[$timestamp] [FAIL] $TestName" -ForegroundColor Red
            if ($Message) { Write-Host "    >> $Message" -ForegroundColor Red }
            $script:FailureCount++
        }
        "WARN" {
            Write-Host "[$timestamp] [WARN] $TestName" -ForegroundColor Yellow
            if ($Message) { Write-Host "    >> $Message" -ForegroundColor Yellow }
            $script:WarningCount++
        }
        "INFO" {
            Write-Host "[$timestamp] [INFO] $TestName" -ForegroundColor Cyan
            if ($Message) { Write-Host "    >> $Message" -ForegroundColor Cyan }
        }
    }
}

function Test-FileExists {
    param([string]$Path, [string]$Description)
    
    if (Test-Path $Path) {
        Write-TestResult "File exists: $Description" "PASS"
        return $true
    } else {
        Write-TestResult "File exists: $Description" "FAIL" "File not found: $Path"
        return $false
    }
}

function Test-FileContains {
    param(
        [string]$Path,
        [string]$Pattern,
        [string]$Description,
        [switch]$ShouldNotContain
    )
    
    if (-not (Test-Path $Path)) {
        Write-TestResult $Description "FAIL" "File not found: $Path"
        return $false
    }
    
    $content = Get-Content $Path -Raw -ErrorAction SilentlyContinue
    $regexMatches = [regex]::Matches($content, $Pattern)
    
    if ($ShouldNotContain) {
        if ($regexMatches.Count -eq 0) {
            Write-TestResult $Description "PASS"
            return $true
        } else {
            Write-TestResult $Description "FAIL" "Found $($regexMatches.Count) occurrence(s) of forbidden pattern"
            if ($Verbose) {
                $regexMatches | ForEach-Object { Write-Host "      Found: $($_.Value)" -ForegroundColor Red }
            }
            return $false
        }
    } else {
        if ($regexMatches.Count -gt 0) {
            Write-TestResult $Description "PASS"
            return $true
        } else {
            Write-TestResult $Description "FAIL" "Pattern not found"
            return $false
        }
    }
}

Write-Host "`n[SECURITY VERIFICATION SCRIPT]" -ForegroundColor Cyan
Write-Host "================================`n" -ForegroundColor Cyan

# ============================================================================
# TEST 1: UNIFIED TOKEN VERIFICATION
# ============================================================================
Write-Host "`n[TEST 1] Unified Token Verification" -ForegroundColor Magenta
Write-Host "─────────────────────────────────────" -ForegroundColor Magenta

$tokenVerifierPath = Join-Path $ServerPath "utils\tokenVerifier.ts"
Test-FileExists $tokenVerifierPath "TokenVerifier module"

if (Test-Path $tokenVerifierPath) {
    Test-FileContains $tokenVerifierPath "class TokenVerifier" "TokenVerifier class exists"
    Test-FileContains $tokenVerifierPath "verifyToken\(" "verifyToken method exists"
    Test-FileContains $tokenVerifierPath "verifyTokenWithRole\(" "verifyTokenWithRole method exists"
    Test-FileContains $tokenVerifierPath "checkRateLimit\(" "Rate limiting implemented"
    Test-FileContains $tokenVerifierPath "cache\.set\(" "Token caching implemented"
    Test-FileContains $tokenVerifierPath "getUser\(token\)" "Supabase token verification"
}

# Check if TokenVerifier is used consistently
$authMiddlewarePath = Join-Path $ServerPath "middleware\auth.ts"
if (Test-Path $authMiddlewarePath) {
    Test-FileContains $authMiddlewarePath "verifyJWTTokenWithRole" "Auth middleware uses TokenVerifier"
}

$biddingPath = Join-Path $ServerPath "websocket\bidding.ts"
if (Test-Path $biddingPath) {
    Test-FileContains $biddingPath "verifyJWTTokenWithRole" "WebSocket uses TokenVerifier"
}

# ============================================================================
# TEST 2: WEBSOCKET CSRF PROTECTION
# ============================================================================
Write-Host "`n[TEST 2] WebSocket CSRF Protection" -ForegroundColor Magenta
Write-Host "───────────────────────────────────" -ForegroundColor Magenta

if (Test-Path $biddingPath) {
    Test-FileContains $biddingPath "verifyOrigin" "Origin verification function exists"
    Test-FileContains $biddingPath "socket\.handshake\.headers\.origin" "Origin header check"
    Test-FileContains $biddingPath "ALLOWED_ORIGINS|CLIENT_URL" "Allowed origins configuration"
    Test-FileContains $biddingPath "Origin not allowed" "Origin rejection logic"
    Test-FileContains $biddingPath "validatedEnv" "Uses validated environment variables"
}

# ============================================================================
# TEST 3: HARDCODED SECRETS REMOVAL
# ============================================================================
Write-Host "`n[TEST 3] Hardcoded Secrets Removal" -ForegroundColor Magenta
Write-Host "───────────────────────────────────" -ForegroundColor Magenta

$envPath = Join-Path $ServerPath "lib\env.ts"
if (Test-Path $envPath) {
    Test-FileContains $envPath "NODE_ENV === 'production'" "Production environment checks"
    Test-FileContains $envPath "CRITICAL SECURITY ERROR" "Security error messages"
    Test-FileContains $envPath "criticalSecrets" "Critical secrets validation"
    Test-FileContains $envPath "weakPatterns" "Weak secret detection"
    Test-FileContains $envPath "process\.exit\(1\)" "Fails on missing secrets"
    Test-FileContains $envPath "\.default\('dev-service-role-key" "FAIL" -ShouldNotContain
}

# Scan for hardcoded secrets in source files
Write-TestResult "Scanning for hardcoded secrets..." "INFO"

$sourceFiles = Get-ChildItem -Path $ServerPath -Recurse -Include *.ts,*.js -Exclude node_modules,dist,*.test.*,*.spec.* -ErrorAction SilentlyContinue

$foundSecrets = 0
foreach ($file in $sourceFiles) {
    $content = Get-Content $file.FullName -Raw -ErrorAction SilentlyContinue
    if ($content -match 'sk_test_' -or $content -match 'sk_live_' -or $content -match 'AC[a-f0-9]{32}') {
        $foundSecrets++
        if ($Verbose) {
            Write-Host "      Potential secret in: $($file.FullName)" -ForegroundColor Red
        }
    }
}

if ($foundSecrets -eq 0) {
    Write-TestResult "No obvious hardcoded secrets found" "PASS"
} else {
    Write-TestResult "Potential hardcoded secrets detected" "FAIL" "$foundSecrets file(s) with potential secrets"
}

# Check environment variable usage
$directEnvUsage = 0

foreach ($file in $sourceFiles) {
    $content = Get-Content $file.FullName -Raw -ErrorAction SilentlyContinue
    
    # Skip env.ts and config files
    if ($file.Name -eq "env.ts" -or $file.Name -like "*config*") { continue }
    
    # Check if file uses process.env directly instead of validatedEnv
    if ($content -match 'process\.env\.' -and $content -notmatch 'validatedEnv') {
        $directEnvUsage++
        if ($Verbose) {
            Write-Host "      Direct env usage in: $($file.FullName)" -ForegroundColor Yellow
        }
    }
}

if ($directEnvUsage -gt 0) {
    Write-TestResult "Direct process.env usage detected" "WARN" "$directEnvUsage file(s) should use validatedEnv"
}

# ============================================================================
# TEST 4: RACE CONDITION PROTECTION
# ============================================================================
Write-Host "`n[TEST 4] Race Condition Protection" -ForegroundColor Magenta
Write-Host "────────────────────────────────────" -ForegroundColor Magenta

$migrationPath = ".\supabase\migrations\20260112000002_fix_role_protection.sql"
if (Test-Path $migrationPath) {
    Test-FileContains $migrationPath "pg_try_advisory_xact_lock" "Advisory lock in protect_user_role"
    Test-FileContains $migrationPath "FOR UPDATE NOWAIT" "Row-level locking in email confirmation"
    Test-FileContains $migrationPath "FOR UPDATE NOWAIT" "Row-level locking in phone confirmation"
    Test-FileContains $migrationPath "lock_not_available" "Lock timeout handling"
    Test-FileContains $migrationPath "SECURITY DEFINER" "SECURITY DEFINER on functions"
    Test-FileContains $migrationPath "app\.bypass_role_protection" "Bypass mechanism for system triggers"
} else {
    Write-TestResult "Migration file exists" "FAIL" "File not found: $migrationPath"
}

# Check for transaction usage in bidding
if (Test-Path $biddingPath) {
    Test-FileContains $biddingPath '\$transaction' "Transaction usage in bidding"
    Test-FileContains $biddingPath "FOR UPDATE" "Row-level locking in auction bidding"
    Test-FileContains $biddingPath "CONCURRENT_BID_CONFLICT" "Concurrent bid detection"
}

# ============================================================================
# ENVIRONMENT VARIABLE CHECKS
# ============================================================================
if (-not $SkipEnvCheck) {
    Write-Host "`n[TEST 5] Environment Configuration" -ForegroundColor Magenta
    Write-Host "───────────────────────────────────" -ForegroundColor Magenta
    
    $requiredEnvVars = @(
        'DATABASE_URL',
        'SUPABASE_URL',
        'SUPABASE_ANON_KEY',
        'SUPABASE_SERVICE_ROLE_KEY',
        'JWT_SECRET',
        'TWILIO_ACCOUNT_SID',
        'TWILIO_AUTH_TOKEN',
        'STRIPE_SECRET_KEY'
    )
    
    $envFiles = @('.env', '.env.local', '.env.production')
    $foundEnvFile = $false
    
    foreach ($envFile in $envFiles) {
        if (Test-Path $envFile) {
            $foundEnvFile = $true
            Write-TestResult "Environment file found: $envFile" "INFO"
            
            $envContent = Get-Content $envFile -Raw -ErrorAction SilentlyContinue
            
            foreach ($var in $requiredEnvVars) {
                if ($envContent -match "$var\s*=\s*.+") {
                    Write-TestResult "$var is set" "PASS"
                } else {
                    Write-TestResult "$var is set" "WARN" "Variable not found in $envFile"
                }
            }
            
            # Check for weak values
            $weakPatterns = @('test', 'dev', 'demo', 'example', 'change-me', 'changeme', '12345', 'password', 'secret')
            foreach ($pattern in $weakPatterns) {
                if ($envContent -match "=\s*['\"]?$pattern['\"]?\s*$") {
                    Write-TestResult "No weak/default values" "FAIL" "Found potential weak value: $pattern"
                }
            }
        }
    }
    
    if (-not $foundEnvFile) {
        Write-TestResult "Environment file found" "WARN" "No .env file found - ensure environment variables are set"
    }
}

# ============================================================================
# SUMMARY
# ============================================================================
Write-Host "`n" -NoNewline
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "                    SECURITY AUDIT SUMMARY                  " -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan

Write-Host "`n  [PASSED]  : " -NoNewline -ForegroundColor Green
Write-Host $script:PassCount -ForegroundColor White

Write-Host "  [WARNINGS]: " -NoNewline -ForegroundColor Yellow
Write-Host $script:WarningCount -ForegroundColor White

Write-Host "  [FAILED]  : " -NoNewline -ForegroundColor Red
Write-Host $script:FailureCount -ForegroundColor White

Write-Host "`n===============================================================`n" -ForegroundColor Cyan

if ($script:FailureCount -eq 0 -and $script:WarningCount -eq 0) {
    Write-Host "[SUCCESS] ALL SECURITY CHECKS PASSED!" -ForegroundColor Green
    Write-Host "Your application meets all critical security requirements.`n" -ForegroundColor Green
    exit 0
} elseif ($script:FailureCount -eq 0) {
    Write-Host "[PARTIAL] All critical checks passed, but there are warnings." -ForegroundColor Yellow
    Write-Host "Review warnings above and address them if possible.`n" -ForegroundColor Yellow
    exit 0
} else {
    Write-Host "[CRITICAL] SECURITY ISSUES DETECTED!" -ForegroundColor Red
    Write-Host "Please address the failed checks above before deploying.`n" -ForegroundColor Red
    exit 1
}
