# Raport Diagnostyczny Bazy Danych
**Data:** 2026-01-19

## Podsumowanie
Przeprowadzono pełną diagnostykę struktury i działania bazy danych. Aplikacja łączy się poprawnie, a główne tabele są zgodne ze schematem. Zidentyfikowano potencjalny brak procedur składowanych (funkcji SQL), co może wpływać na automatyzację (np. aktualizację `updated_at`).

## Szczegółowe Wyniki

### 1. Struktura Bazy Danych (Schema)
✅ **Status: POPRAWNY**
- Wszystkie 14 wymaganych tabel (m.in. `users`, `auctions`, `bids`) istnieje.
- Kolumny w tabelach odpowiadają definicjom w `schema.prisma`.

### 2. Operacje i Dane
✅ **Status: POPRAWNY**
- **Połączenie:** Stabilne.
- **Użytkownicy:** Wykryto 6 kont (w tym 1 Administrator).
- **Aukcje:** Wykryto 1 aukcję testową.
- **Relacje:** Poprawnie pobrano dane powiązane (aukcja -> brak ofert, brak profilu gołębia dla aukcji testowej).

### 3. Funkcje Bazodanowe (Triggery)
⚠️ **Status: OSTRZEŻENIE**
Narzędzie diagnostyczne nie wykryło w schemacie `public` następujących funkcji:
- `handle_new_user` (synchronizacja Auth -> User)
- `handle_email_confirmation`
- `handle_updated_at`

**Wnioski:** Baza mogła zostać utworzona przez `prisma db push` zamiast pełnej migracji SQL, przez co brakuje triggerów. Jeśli rejestracja użytkowników działa poprawnie, funkcje mogą znajdować się w innym schemacie lub być zarządzane przez Supabase Auth bezpośrednio. Warto to zweryfikować, jeśli pojawią się problemy z `updated_at` lub synchronizacją użytkowników.

## Zalecenia
1. Regularnie uruchamiaj `scripts/check-columns.ts` po zmianach w modelu.
2. Jeśli zauważysz brak automatycznych aktualizacji dat lub problem z rejestracją, należy ręcznie zaaplikować migracje z folderu `supabase/migrations`.
