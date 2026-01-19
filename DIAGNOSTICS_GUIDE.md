# Przewodnik Diagnostyki Bazy Danych

W tym folderze znajdują się narzędzia do weryfikacji poprawności działania i struktury bazy danych projektu.

## Dostępne skrypty

### 1. `scripts/check-columns.ts`
Służy do weryfikacji zgodności struktury bazy danych (tabele i kolumny) z definicją w pliku `schema.prisma`.

**Uruchomienie:**
```bash
npx tsx scripts/check-columns.ts
```

**Co sprawdza:**
- Czy wszystkie wymagane tabele istnieją.
- Czy każda tabela posiada wymagane kolumny.
- Raportuje brakujące elementy.

### 2. `scripts/check-db-operations.ts`
Służy do weryfikacji połączenia oraz podstawowych operacji CRUD i logicznych bazy danych.

**Uruchomienie:**
```bash
npx tsx scripts/check-db-operations.ts
```

**Co sprawdza:**
- Połączenie z bazą danych.
- Liczbę rekordów w kluczowych tabelach (`users`, `auctions`).
- Poprawność relacji (pobieranie aukcji wraz z ofertami i profilami gołębi).
- Istnienie kont administratorów.
- Obecność kluczowych funkcji bazodanowych (triggerów PL/pgSQL).

## Rozwiązywanie problemów

Jeśli skrypty zwracają błędy:
1. Sprawdź plik `.env` (lub `server/.env`) czy zawiera poprawny `DATABASE_URL`.
2. Upewnij się, że Twój adres IP jest dozwolony w ustawieniach Supabase (jeśli dotyczy).
3. Sprawdź logi pod kątem błędów połączenia (timeout, auth failed).
