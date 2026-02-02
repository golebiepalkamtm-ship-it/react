-- Fix metrics table: change target_id from UUID to TEXT to support 'global' values

-- 1) Usuń constraint, jeśli istnieje
ALTER TABLE public.metrics
  DROP CONSTRAINT IF EXISTS metrics_scope_target_id_key;

-- 1b) Usuń indeks o tej samej nazwie, jeśli istnieje
DROP INDEX IF EXISTS public.metrics_scope_target_id_key;

-- 2) Zmień typ kolumny (bezpieczne jeśli już jest TEXT)
ALTER TABLE public.metrics
  ALTER COLUMN target_id TYPE TEXT USING target_id::text;

-- 3) Utwórz ponownie unikalne ograniczenie (powinno się teraz powieść)
ALTER TABLE public.metrics
  ADD CONSTRAINT metrics_scope_target_id_key UNIQUE (scope, target_id);
