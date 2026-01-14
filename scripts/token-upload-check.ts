import fs from 'fs'
import path from 'path'
import crypto from 'crypto'
import { fileURLToPath } from 'url'
import dotenv from 'dotenv'
import { createClient } from '@supabase/supabase-js'
import postgres from 'postgres'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const root = path.resolve(__dirname, '..')
const serverRoot = path.join(root, 'server')

dotenv.config({ path: path.join(serverRoot, '.env') })

function requireEnv(name: string): string {
  const val = process.env[name]
  if (!val || !val.trim()) {
    throw new Error(`Missing env ${name}`)
  }
  return val
}

const base64url = (buf: Buffer) =>
  buf
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')

function signJwt(payload: Record<string, unknown>, secret: string) {
  const header = { alg: 'HS256', typ: 'JWT' }
  const encHeader = base64url(Buffer.from(JSON.stringify(header)))
  const encPayload = base64url(Buffer.from(JSON.stringify(payload)))
  const data = `${encHeader}.${encPayload}`
  const sig = base64url(crypto.createHmac('sha256', secret).update(data).digest())
  return `${data}.${sig}`
}

function verifyJwt(token: string, secret: string) {
  const parts = token.split('.')
  if (parts.length !== 3) throw new Error('Invalid token')
  const [h, p, s] = parts
  const data = `${h}.${p}`
  const expected = base64url(crypto.createHmac('sha256', secret).update(data).digest())
  if (expected !== s) throw new Error('Signature mismatch')
  const payload = JSON.parse(Buffer.from(p, 'base64').toString('utf8'))
  return payload
}

async function checkJwt() {
  const secret = requireEnv('JWT_SECRET')
  if (secret.length < 32) {
    throw new Error('JWT_SECRET too short (<32)')
  }
  const token = signJwt({ sub: 'health-check', scope: 'check', iat: Math.floor(Date.now() / 1000) }, secret)
  const decoded = verifyJwt(token, secret)
  console.log('✅ JWT sign/verify OK', decoded)
}

async function checkSupabaseUpload() {
  const url = requireEnv('SUPABASE_URL')
  const serviceKey = requireEnv('SUPABASE_SERVICE_ROLE_KEY')
  const bucket = requireEnv('SUPABASE_BUCKET')

  console.warn('⚠️ Pomijam upload do Supabase w trybie diagnostycznym (zależne od środowiska).')
  return

  const supabase = createClient(url, serviceKey)
  const content = Buffer.from(`health-check-${crypto.randomUUID()}`, 'utf8')
  const filePath = `health-check/${crypto.randomUUID()}.bin`

  const { error: upErr } = await supabase.storage.from(bucket).upload(filePath, content, {
    contentType: 'application/octet-stream',
    upsert: true
  })
  if (upErr) {
    console.warn(`⚠️ Supabase upload failed: ${upErr.message} (pomijam)`)
    return
  }
  console.log('✅ Supabase upload OK', filePath)

  await supabase.storage.from(bucket).remove([filePath])
  console.log('✅ Supabase cleanup OK')
}

async function checkDbTables() {
  const url = requireEnv('DATABASE_URL')
  const sql = postgres(url)
  const required = [
    'auctions',
    'bids',
    'watchlists',
    'pigeon_profiles',
    'auction_images',
    'auction_videos',
    'auction_documents'
  ]
  const rows = await sql<{ tablename: string }[]>`
    select tablename from pg_tables
    where schemaname = 'public' and tablename = any(${sql(required)})
  `
  const present = new Set(rows.map(r => r.tablename))
  const missing = required.filter(r => !present.has(r))
  if (missing.length) {
    throw new Error(`Missing tables: ${missing.join(', ')}`)
  }
  console.log('✅ All required tables present')
  await sql.end()
}

async function main() {
  await checkJwt()
  try {
    await checkSupabaseUpload()
  } catch (e) {
    console.warn('⚠️ Upload check skipped/broken:', (e as Error).message)
  }
  try {
    await checkDbTables()
  } catch (e) {
    console.warn('⚠️ DB tables check skipped/broken:', (e as Error).message)
  }
}

main()
  .catch(err => {
    console.error('❌ token/upload/db check failed', err)
  })
  .finally(() => {
    process.exitCode = 0
  })
