# Deploying Champion Pigeon Auctions to Railway

Krótkie kroki, aby skonfigurować projekt na Railway (polski):

1. Zainstaluj Railway CLI lokalnie:

```
curl -sSL https://railway.app/install.sh | sh
```

2. Zaloguj się i utwórz/połącz projekt:

```
railway login
railway init    # utworzy projekt lub podpowie
railway link    # jeśli chcesz podłączyć do istniejącego projektu
```

3. Ustaw zmienne środowiskowe w Railway Dashboard albo dodaj je przez CLI. Użyj `.env.railway.example` jako wzoru.

4. W repo znajduje się workflow GitHub Actions `.github/workflows/railway-deploy.yml`, który:
- loguje się do Railway (wymaga `RAILWAY_API_KEY` w GitHub Secrets)
- uruchamia `railway up --detach` na push do gałęzi `main`

5. Dodaj secret w GitHub repo: `RAILWAY_API_KEY` (możesz wygenerować token w Railway settings)

Skrypty pomocnicze (znajdują się w `scripts/`):

- `scripts/railway-init.sh` — instaluje Railway CLI, loguje i uruchamia `railway init` lub `railway link` gdy `RAILWAY_PROJECT_ID` jest ustawione.
- `scripts/railway-init.ps1` — wersja PowerShell dla Windows.
- `scripts/railway-set-env.sh` — czyta `.env.railway.example` i ustawia zmienne w aktualnie podłączonym projekcie Railway (używa `railway variables set`).

Użycie (bash):

```
export RAILWAY_API_KEY=...
export RAILWAY_PROJECT_ID=...   # opcjonalnie
./scripts/railway-init.sh
./scripts/railway-set-env.sh
```

Użycie (PowerShell):

```
$env:RAILWAY_API_KEY = '...'
.
\scripts\railway-init.ps1
```

Uwaga: skrypty zakładają, że projekt jest zlinkowany (`railway link`) przed importem zmiennych. Jeśli `railway init` utworzy projekt, pamiętaj, aby uruchomić `railway link <projectId>` lub ustawić `RAILWAY_PROJECT_ID`.

6. Lokalne uruchomienie (dev):

```
npm run dev
cd server && npm run dev
```

Uwagi:
- Repo zawiera `Dockerfile.frontend` i `Dockerfile.production` — możesz stworzyć usługi Docker na Railway zamiast używać `railway up` bezpośrednio.
- Jeśli chcesz, mogę uruchomić `railway init` lokalnie (wymaga Twojego API key) albo dodać plik `railway.toml` z gotową konfiguracją usług — daj znać.
