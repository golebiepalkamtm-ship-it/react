# Sprawdzenie konfiguracji bazy danych Supabase

## 📋 Podsumowanie

**Projekt:** `nctvwxiqzbedgcmetyal` (react)  
**URL:** `https://nctvwxiqzbedgcmetyal.supabase.co`  
**Status:** ACTIVE_HEALTHY  
**Region:** eu-west-1  
**PostgreSQL:** 17.6.1.063

---

## 📊 Struktura bazy danych

### Schemat `public` - Tabele aplikacji

#### 1. **users** (3 wiersze)
- **RLS:** ✅ Włączone
- **Kolumny:**
  - `id` (UUID, PK, FK → auth.users)
  - `email`, `phone`, `name`
  - `role` (CHECK: USER_REGISTERED, USER_EMAIL_VERIFIED, USER_FULL_VERIFIED, ADMIN)
  - `street`, `postal_code`, `country` (adres)
  - `first_name`, `last_name`, `city`, `avatar_url`
  - `is_blocked`, `is_banned`, `blocked_until`, `banned_until`
  - `created_at`, `updated_at`
- **Polityki RLS:**
  - ✅ Users can view own profile
  - ✅ Users can update own profile
  - ✅ Users can insert own profile

#### 2. **profiles** (3 wiersze)
- **RLS:** ✅ Włączone
- **Kolumny:**
  - `id` (UUID, PK, FK → auth.users)
  - `full_name`, `avatar_url`, `website`, `bio`
  - `role` (CHECK: USER_REGISTERED, USER_EMAIL_VERIFIED, USER_FULL_VERIFIED, ADMIN)
  - `created_at`, `updated_at`
- **Polityki RLS:**
  - ✅ Profiles: users can view own profile or admin
  - ✅ Profiles: users can update own profile
  - ✅ Profiles: insert for new users
  - ✅ Profiles: delete own or admin

#### 3. **auctions** (0 wierszy)
- **RLS:** ✅ Włączone
- **Kolumny:**
  - `id` (UUID, PK, default: gen_random_uuid())
  - `title`, `description`
  - `owner_id` (UUID, FK → users.id, nullable)
  - `starting_price`, `current_price` (numeric)
  - `buy_now_price`, `reserve_price` (numeric, nullable)
  - `reserve_met` (boolean, default: true)
  - `status` (CHECK: draft, open, closed, cancelled)
  - `starts_at`, `ends_at` (timestamptz)
  - `snipe_threshold_minutes` (int, default: 2)
  - `snipe_extension_minutes` (int, default: 2)
  - `min_bid_increment` (numeric, default: 100)
  - `category` (text, default: 'racing')
  - `age` (int, default: 0)
  - `sex` (text, default: 'male')
  - `location` (text, default: '')
  - `pigeon` (jsonb, default: '{}')
  - `images`, `videos`, `documents` (jsonb, default: '[]')
  - `created_at`, `updated_at`
- **Polityki RLS:**
  - ✅ Public can select auctions
  - ✅ Owners can insert auctions
  - ✅ Owners can update auctions
  - ✅ Owners can delete auctions

#### 4. **bids** (0 wierszy)
- **RLS:** ✅ Włączone
- **Kolumny:**
  - `id` (UUID, PK, default: gen_random_uuid())
  - `auction_id` (UUID, FK → auctions.id, CASCADE)
  - `bidder_id` (UUID, FK → users.id, nullable)
  - `display_name` (text, nullable)
  - `amount` (numeric)
  - `created_at`
- **Polityki RLS:**
  - ✅ Public can select bids for auctions
  - ✅ Users can insert own bids
  - ✅ Users can update bids
  - ✅ Users can delete bids

#### 5. **watchlists** (0 wiersze)
- **RLS:** ✅ Włączone
- **Kolumny:**
  - `id` (UUID, PK, default: gen_random_uuid())
  - `user_id` (UUID, FK → users.id, CASCADE)
  - `auction_id` (UUID, FK → auctions.id, CASCADE)
  - `created_at`
  - **UNIQUE** (user_id, auction_id)
- **Polityki RLS:**
  - ✅ Users can manage own watchlist

#### 6. **meetings** (0 wierszy)
- **RLS:** ✅ Włączone
- **Kolumny:**
  - `id` (UUID, PK, default: gen_random_uuid())
  - `name`, `location`, `description`
  - `date` (date)
  - `images` (jsonb, default: '[]')
  - `author_id` (UUID, FK → auth.users.id)
  - `created_at`, `updated_at`
- **Polityki RLS:**
  - ✅ Authenticated users can insert meetings
  - ✅ Authors can update meetings
  - ✅ Authors can delete meetings

### Schemat `auth` - Tabele Supabase Auth

- **users** (3 wiersze) - główna tabela użytkowników
- **sessions** (4 wiersze) - sesje użytkowników
- **refresh_tokens** (4 wiersze) - tokeny odświeżania
- **identities** (3 wiersze) - tożsamości OAuth
- **mfa_factors** (0 wierszy) - czynniki MFA
- **mfa_challenges** (0 wierszy) - wyzwania MFA
- **audit_log_entries** (7 wierszy) - logi audytu
- **oauth_clients** (0 wierszy) - klienci OAuth
- **oauth_authorizations** (0 wierszy) - autoryzacje OAuth
- **flow_state** (2 wiersze) - stan przepływu PKCE

---

## 🔌 Rozszerzenia (Extensions)

### Zainstalowane rozszerzenia:

1. **uuid-ossp** (1.1) - generowanie UUID
2. **pgcrypto** (1.3) - funkcje kryptograficzne
3. **pg_stat_statements** (1.11) - statystyki zapytań SQL
4. **supabase_vault** (0.3.1) - Supabase Vault
5. **pg_graphql** (1.5.11) - GraphQL API

### Dostępne (niezainstalowane) rozszerzenia:

- **vector** (0.8.0) - dla AI/embeddings
- **postgis** (3.3.7) - geospatial data
- **pg_trgm** (1.6) - full-text search
- **pg_cron** (1.6.4) - scheduled jobs
- **pg_net** (0.19.5) - async HTTP

---

## 📝 Migracje

### Zastosowane migracje:

1. `20251130100000` - setup_security
2. `20251130100001` - create_profiles
3. `20251230` - place_bid_atomic_v2
4. `20260101` - setup_users
5. `20260102` - update_snipping_logic
6. `20260103` - users_backfill
7. `20260104120000` - create_auctions
8. `20260104120001` - add_address
9. `20260104120005` - create_auctions_view
10. `20260104120006` - create_meetings
11. `20260105130000` - apply_missing_objects

---

## ⚠️ Problemy wydajnościowe

### 1. **Auth RLS Initialization Plan** (WARNING) - 13 polityk

**Problem:** Polityki RLS używają `auth.uid()` bezpośrednio, co powoduje ponowne wywoływanie dla każdego wiersza.

**Tabele dotknięte:**
- `users` (3 polityki)
- `profiles` (4 polityki)
- `auctions` (3 polityki)
- `bids` (3 polityki)
- `watchlists` (1 polityka)
- `meetings` (3 polityki)

**Rozwiązanie:**
Zamień `auth.uid()` na `(select auth.uid())` w politykach RLS.

**Przykład poprawki:**
```sql
-- PRZED:
CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

-- PO:
CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT USING ((select auth.uid()) = id);
```

**Dokumentacja:** https://supabase.com/docs/guides/database/postgres/row-level-security#call-functions-with-select

### 2. **Unindexed Foreign Keys** (INFO)

**Problem:** Tabela `meetings` ma foreign key `meetings_author_id_fkey` bez indeksu.

**Rozwiązanie:**
```sql
CREATE INDEX IF NOT EXISTS idx_meetings_author_id 
ON public.meetings(author_id);
```

### 3. **Unused Indexes** (INFO) - 5 indeksów

**Indeksy nieużywane:**
- `idx_auctions_owner_id` na `auctions`
- `idx_bids_auction_id` na `bids`
- `idx_bids_bidder_id` na `bids`
- `idx_watchlists_user_id` na `watchlists`
- `idx_watchlists_auction_id` na `watchlists`

**Rekomendacja:** 
- Sprawdź czy indeksy są rzeczywiście potrzebne
- Jeśli nie są używane, rozważ ich usunięcie (oszczędność miejsca)
- Jeśli będą potrzebne w przyszłości, zostaw je

---

## 🔒 Problemy bezpieczeństwa

### 1. **Security Definer View** (ERROR)

**Problem:** View `active_auctions_summary` używa `SECURITY DEFINER`.

**Szczegóły:**
- View wykonuje się z uprawnieniami twórcy, nie użytkownika
- Może być podatne na nadużycia

**Rozwiązanie:**
- Przejrzyj view i upewnij się, że jest bezpieczne
- Rozważ użycie `SECURITY INVOKER` jeśli to możliwe
- Sprawdź: https://supabase.com/dashboard/project/nctvwxiqzbedgcmetyal/database/security-advisor

---

## ✅ Pozytywne aspekty

1. **RLS włączone** na wszystkich tabelach publicznych ✅
2. **Foreign keys** poprawnie zdefiniowane ✅
3. **Triggers** dla automatycznej aktualizacji ról użytkowników ✅
4. **Timestamps** (`created_at`, `updated_at`) automatycznie zarządzane ✅
5. **CHECK constraints** dla walidacji danych ✅
6. **CASCADE** dla relacji gdzie potrzebne ✅

---

## 🔧 Rekomendacje

### Wydajność

1. **Napraw polityki RLS** - użyj `(select auth.uid())` zamiast `auth.uid()`
2. **Dodaj indeks** na `meetings.author_id`
3. **Przeanalizuj nieużywane indeksy** - usuń lub zostaw w zależności od potrzeb

### Bezpieczeństwo

1. **Przejrzyj Security Definer View** - upewnij się, że jest bezpieczne
2. **Włącz Leaked Password Protection** (z poprzedniego raportu)

### Struktura

1. **Rozważ normalizację** - tabela `auctions` ma dużo kolumn, rozważ wydzielenie `pigeon_profiles`
2. **JSONB columns** - `pigeon`, `images`, `videos`, `documents` w `auctions` - rozważ osobne tabele dla lepszej wydajności
3. **Indeksy na JSONB** - jeśli używasz zapytań na JSONB, dodaj indeksy GIN

### Migracje

1. **Dokumentuj migracje** - dodaj komentarze do każdej migracji
2. **Testuj migracje** - upewnij się, że wszystkie migracje są idempotentne

---

## 📊 Indeksy w bazie danych

### Tabela `auctions`
- `auctions_pkey` (PRIMARY KEY na `id`)
- `idx_auctions_owner_id` (na `owner_id`) - ⚠️ nieużywany
- `idx_auctions_status` (na `status`)

### Tabela `bids`
- `bids_pkey` (PRIMARY KEY na `id`)
- `idx_bids_auction_id` (na `auction_id`) - ⚠️ nieużywany
- `idx_bids_bidder_id` (na `bidder_id`) - ⚠️ nieużywany

### Tabela `watchlists`
- `watchlists_pkey` (PRIMARY KEY na `id`)
- `watchlists_user_id_auction_id_key` (UNIQUE na `user_id, auction_id`)
- `idx_watchlists_user_id` (na `user_id`) - ⚠️ nieużywany
- `idx_watchlists_auction_id` (na `auction_id`) - ⚠️ nieużywany

### Tabela `meetings`
- `meetings_pkey` (PRIMARY KEY na `id`)
- ⚠️ **BRAKUJE:** indeks na `author_id` (foreign key)

### Tabela `users`
- `users_pkey` (PRIMARY KEY na `id`)

### Tabela `profiles`
- `profiles_pkey` (PRIMARY KEY na `id`)

---

## 📊 Statystyki

- **Tabele publiczne:** 6
- **Tabele auth:** 20+
- **Polityki RLS:** 20+
- **Foreign keys:** 10+
- **Indeksy:** 13 (w tym 5 nieużywanych)
- **Rozszerzenia zainstalowane:** 5
- **Migracje:** 11

---

## 🔗 Linki do Dashboard

- **Database Tables:** https://supabase.com/dashboard/project/nctvwxiqzbedgcmetyal/editor
- **Database Extensions:** https://supabase.com/dashboard/project/nctvwxiqzbedgcmetyal/database/extensions
- **Database Migrations:** https://supabase.com/dashboard/project/nctvwxiqzbedgcmetyal/database/migrations
- **Security Advisor:** https://supabase.com/dashboard/project/nctvwxiqzbedgcmetyal/database/security-advisor
- **Performance Advisor:** https://supabase.com/dashboard/project/nctvwxiqzbedgcmetyal/database/performance-advisor

---

## 📝 SQL do naprawy problemów

### 1. Napraw polityki RLS (wydajność)

```sql
-- Users table
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT USING ((select auth.uid()) = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING ((select auth.uid()) = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON public.users;
CREATE POLICY "Users can insert own profile" ON public.users
  FOR INSERT WITH CHECK ((select auth.uid()) = id);

-- Profiles table
DROP POLICY IF EXISTS "Profiles: users can view own profile or admin" ON public.profiles;
CREATE POLICY "Profiles: users can view own profile or admin" ON public.profiles
  FOR SELECT USING ((select auth.uid()) = id OR EXISTS (
    SELECT 1 FROM public.users u 
    WHERE u.id = (select auth.uid()) AND u.role = 'ADMIN'
  ));

DROP POLICY IF EXISTS "Profiles: users can update own profile" ON public.profiles;
CREATE POLICY "Profiles: users can update own profile" ON public.profiles
  FOR UPDATE USING ((select auth.uid()) = id);

DROP POLICY IF EXISTS "Profiles: insert for new users" ON public.profiles;
CREATE POLICY "Profiles: insert for new users" ON public.profiles
  FOR INSERT WITH CHECK ((select auth.uid()) = id);

DROP POLICY IF EXISTS "Profiles: delete own or admin" ON public.profiles;
CREATE POLICY "Profiles: delete own or admin" ON public.profiles
  FOR DELETE USING ((select auth.uid()) = id OR EXISTS (
    SELECT 1 FROM public.users u 
    WHERE u.id = (select auth.uid()) AND u.role = 'ADMIN'
  ));

-- Auctions table
DROP POLICY IF EXISTS "Owners can insert auctions" ON public.auctions;
CREATE POLICY "Owners can insert auctions" ON public.auctions
  FOR INSERT WITH CHECK ((select auth.uid()) = owner_id);

DROP POLICY IF EXISTS "Owners can update auctions" ON public.auctions;
CREATE POLICY "Owners can update auctions" ON public.auctions
  FOR UPDATE USING ((select auth.uid()) = owner_id OR EXISTS (
    SELECT 1 FROM public.users u 
    WHERE u.id = (select auth.uid()) AND u.role = 'ADMIN'
  ));

DROP POLICY IF EXISTS "Owners can delete auctions" ON public.auctions;
CREATE POLICY "Owners can delete auctions" ON public.auctions
  FOR DELETE USING ((select auth.uid()) = owner_id OR EXISTS (
    SELECT 1 FROM public.users u 
    WHERE u.id = (select auth.uid()) AND u.role = 'ADMIN'
  ));

-- Bids table
DROP POLICY IF EXISTS "Users can insert own bids" ON public.bids;
CREATE POLICY "Users can insert own bids" ON public.bids
  FOR INSERT WITH CHECK ((select auth.uid()) = bidder_id);

DROP POLICY IF EXISTS "Users can update bids" ON public.bids;
CREATE POLICY "Users can update bids" ON public.bids
  FOR UPDATE USING ((select auth.uid()) = bidder_id OR EXISTS (
    SELECT 1 FROM public.users u 
    WHERE u.id = (select auth.uid()) AND u.role = 'ADMIN'
  ));

DROP POLICY IF EXISTS "Users can delete bids" ON public.bids;
CREATE POLICY "Users can delete bids" ON public.bids
  FOR DELETE USING ((select auth.uid()) = bidder_id OR EXISTS (
    SELECT 1 FROM public.users u 
    WHERE u.id = (select auth.uid()) AND u.role = 'ADMIN'
  ));

-- Watchlists table
DROP POLICY IF EXISTS "Users can manage own watchlist" ON public.watchlists;
CREATE POLICY "Users can manage own watchlist" ON public.watchlists
  FOR ALL USING ((select auth.uid()) = user_id) 
  WITH CHECK ((select auth.uid()) = user_id);

-- Meetings table
DROP POLICY IF EXISTS "Authenticated users can insert meetings" ON public.meetings;
CREATE POLICY "Authenticated users can insert meetings" ON public.meetings
  FOR INSERT WITH CHECK ((select auth.uid()) = author_id);

DROP POLICY IF EXISTS "Authors can update meetings" ON public.meetings;
CREATE POLICY "Authors can update meetings" ON public.meetings
  FOR UPDATE USING ((select auth.uid()) = author_id);

DROP POLICY IF EXISTS "Authors can delete meetings" ON public.meetings;
CREATE POLICY "Authors can delete meetings" ON public.meetings
  FOR DELETE USING ((select auth.uid()) = author_id);
```

### 2. Dodaj brakujący indeks

```sql
CREATE INDEX IF NOT EXISTS idx_meetings_author_id 
ON public.meetings(author_id);
```

### 3. Sprawdź nieużywane indeksy (opcjonalnie)

```sql
-- Sprawdź użycie indeksów
SELECT 
  schemaname,
  tablename,
  indexname,
  idx_scan as index_scans
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
  AND indexname IN (
    'idx_auctions_owner_id',
    'idx_bids_auction_id',
    'idx_bids_bidder_id',
    'idx_watchlists_user_id',
    'idx_watchlists_auction_id'
  )
ORDER BY idx_scan;
```

---

**Wygenerowano:** $(date)  
**Projekt ID:** nctvwxiqzbedgcmetyal

