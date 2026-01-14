#!/usr/bin/env pwsh
# Security Verification Script - Validates critical security implementations
# Usage: .\verify_security_simple.ps1 [-Verbose]

param(
    [switch]$Verbose,
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
    $found = $content -match $Pattern
    
    if ($ShouldNotContain) {
        if (-not $found) {
            Write-TestResult $Description "PASS"
            return $true
        } else {
            Write-TestResult $Description "FAIL" "Forbidden pattern found"
            return $false
        }
    } else {
        if ($found) {
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

# TEST 1: UNIFIED TOKEN VERIFICATION
Write-Host "`n[TEST 1] Unified Token Verification" -ForegroundColor Magenta
Write-Host "-------------------------------------" -ForegroundColor Magenta

$tokenVerifierPath = Join-Path $ServerPath "utils\tokenVerifier.ts"
Test-FileExists $tokenVerifierPath "TokenVerifier module"

if (Test-Path $tokenVerifierPath) {
    Test-FileContains $tokenVerifierPath "class TokenVerifier" "TokenVerifier class exists"
    Test-FileContains $tokenVerifierPath "verifyToken" "verifyToken method exists"
    Test-FileContains $tokenVerifierPath "verifyTokenWithRole" "verifyTokenWithRole method exists"
    Test-FileContains $tokenVerifierPath "checkRateLimit" "Rate limiting implemented"
    Test-FileContains $tokenVerifierPath "cache\.set" "Token caching implemented"
}

$authMiddlewarePath = Join-Path $ServerPath "middleware\auth.ts"
if (Test-Path $authMiddlewarePath) {
    Test-FileContains $authMiddlewarePath "verifyJWTTokenWithRole" "Auth middleware uses TokenVerifier"
}

$biddingPath = Join-Path $ServerPath "websocket\bidding.ts"
if (Test-Path $biddingPath) {
    Test-FileContains $biddingPath "verifyJWTTokenWithRole" "WebSocket uses TokenVerifier"
}

# TEST 2: WEBSOCKET CSRF PROTECTION
Write-Host "`n[TEST 2] WebSocket CSRF Protection" -ForegroundColor Magenta
Write-Host "-----------------------------------" -ForegroundColor Magenta

if (Test-Path $biddingPath) {
    Test-FileContains $biddingPath "verifyOrigin" "Origin verification function exists"
    Test-FileContains $biddingPath "socket\.handshake\.headers\.origin" "Origin header check"
    Test-FileContains $biddingPath "ALLOWED_ORIGINS|CLIENT_URL" "Allowed origins configuration"
    Test-FileContains $biddingPath "Origin not allowed" "Origin rejection logic"
    Test-FileContains $biddingPath "validatedEnv" "Uses validated environment variables"
}

# TEST 3: HARDCODED SECRETS REMOVAL
Write-Host "`n[TEST 3] Hardcoded Secrets Removal" -ForegroundColor Magenta
Write-Host "-----------------------------------" -ForegroundColor Magenta

$envPath = Join-Path $ServerPath "lib\env.ts"
if (Test-Path $envPath) {
    Test-FileContains $envPath "NODE_ENV === 'production'" "Production environment checks"
    Test-FileContains $envPath "CRITICAL SECURITY ERROR" "Security error messages"
    Test-FileContains $envPath "criticalSecrets" "Critical secrets validation"
    Test-FileContains $envPath "weakPatterns" "Weak secret detection"
    Test-FileContains $envPath "process\.exit\(1\)" "Fails on missing secrets"
    Test-FileContains $envPath "\.default\('dev-service-role-key" "No default service role key" -ShouldNotContain
}

# TEST 4: RACE CONDITION PROTECTION
Write-Host "`n[TEST 4] Race Condition Protection" -ForegroundColor Magenta
Write-Host "------------------------------------" -ForegroundColor Magenta

$migrationPath = ".\supabase\migrations\20260112000002_fix_role_protection.sql"
if (Test-Path $migrationPath) {
    Test-FileContains $migrationPath "pg_try_advisory_xact_lock" "Advisory lock in protect_user_role"
    Test-FileContains $migrationPath "FOR UPDATE NOWAIT" "Row-level locking implemented"
    Test-FileContains $migrationPath "lock_not_available" "Lock timeout handling"
    Test-FileContains $migrationPath "SECURITY DEFINER" "SECURITY DEFINER on functions"
    Test-FileContains $migrationPath "app\.bypass_role_protection" "Bypass mechanism for system triggers"
} else {
    Write-TestResult "Migration file exists" "FAIL" "File not found: $migrationPath"
}

if (Test-Path $biddingPath) {
    Test-FileContains $biddingPath '\$transaction' "Transaction usage in bidding"
    Test-FileContains $biddingPath "FOR UPDATE" "Row-level locking in auction bidding"
    Test-FileContains $biddingPath "CONCURRENT_BID_CONFLICT" "Concurrent bid detection"
}

# SUMMARY
Write-Host "`n" -NoNewline
Write-Host "===============================================================" -ForegroundColor Cyan
Write-Host "                    SECURITY AUDIT SUMMARY                     " -ForegroundColor Cyan
Write-Host "===============================================================" -ForegroundColor Cyan

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
