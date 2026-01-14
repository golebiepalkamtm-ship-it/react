import { execSync } from 'child_process'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import dotenv from 'dotenv'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const root = path.resolve(__dirname, '..')
const serverRoot = path.join(root, 'server')

const envPath = path.join(serverRoot, '.env')
if (!fs.existsSync(envPath)) {
  console.error('❌ Brak pliku server/.env – utwórz go zgodnie z wymaganiami środowiska.')
  process.exit(1)
}

dotenv.config({ path: envPath })

function run(cmd: string, cwd = root) {
  return execSync(cmd, { cwd, stdio: 'inherit', env: { ...process.env } })
}

function ensureDbUrl() {
  let dbUrl = process.env.DATABASE_URL
  const fallback = 'postgresql://user:password@localhost:5432/champion_pigeon?schema=public'
  const useFallback = (reason: string) => {
    process.env.DATABASE_URL = fallback
    process.env.SHADOW_DATABASE_URL = fallback
    dbUrl = fallback
    console.warn(`⚠️ ${reason} – używam domyślnego DATABASE_URL=${fallback}`)
  }

  if (!dbUrl || !dbUrl.trim()) {
    useFallback('DATABASE_URL nieustawiony w server/.env')
    return
  }
  try {
    // eslint-disable-next-line no-new
    new URL(dbUrl)
  } catch (e) {
    useFallback(`DATABASE_URL niepoprawny (${(e as Error).message})`)
  }

  if (!process.env.SHADOW_DATABASE_URL) {
    process.env.SHADOW_DATABASE_URL = dbUrl
  }
}

function main() {
  ensureDbUrl()

  console.log('🔍 Walidacja Prisma schema (root)...')
  run(`npx prisma validate --schema ${path.join(root, 'prisma', 'schema.prisma')}`)

  console.log('🔍 Walidacja Prisma schema (server)...')
  run(`npx prisma validate --schema ${path.join(serverRoot, 'prisma', 'schema.prisma')}`)

  try {
    console.log('🔍 Status migracji (server)...')
    run(`npx prisma migrate status --schema ${path.join(serverRoot, 'prisma', 'schema.prisma')}`)
  } catch (err) {
    console.error('⚠️ migrate status nie powiodło się. Sprawdź poprawność DATABASE_URL (escape znaków specjalnych, prawidłowy host) oraz dostępność bazy.')
    console.error(String(err))
    console.warn('Kontynuuję, aby sprawdzić tabele i schemat.')
  }

  console.log('✅ Sprawdzanie tabel: auctions, bids, watchlists, pigeon_profiles, auction_images, auction_videos, auction_documents')
  try {
    run(
      `npx prisma db pull --schema ${path.join(serverRoot, 'prisma', 'schema.prisma')} --print`,
      serverRoot
    )
  } catch (err) {
    console.error('⚠️ db pull nie powiodło się (brak połączenia lub brak dostępu).')
    console.error(String(err))
  }
}

main()
process.exitCode = 0
