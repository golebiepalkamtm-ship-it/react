import { existsSync, readdirSync, statSync } from 'fs'
import { join } from 'path'
import { spawnSync } from 'child_process'

const getEnv = () => ({
  ...process.env,
  DIRECT_URL: process.env.DIRECT_URL || process.env.DATABASE_URL || '',
})

const run = (command, args) => {
  const env = {
    ...getEnv(),
  }
  const result = spawnSync(command, args, { stdio: 'inherit', shell: process.platform === 'win32', env })
  if (result.status !== 0) {
    process.exit(result.status ?? 1)
  }
}

const runSql = (sql) => {
  const env = getEnv()
  const result = spawnSync(
    'npx',
    ['prisma', 'db', 'execute', '--stdin', '--schema', 'prisma/schema.prisma'],
    { stdio: ['pipe', 'inherit', 'inherit'], shell: process.platform === 'win32', env, input: sql },
  )
  if (result.status !== 0) {
    process.exit(result.status ?? 1)
  }
}

const migrationsDir = join(process.cwd(), 'prisma', 'migrations')

const hasMigrations =
  existsSync(migrationsDir)
  && readdirSync(migrationsDir).some((entry) => {
    const fullPath = join(migrationsDir, entry)
    return statSync(fullPath).isDirectory() && existsSync(join(fullPath, 'migration.sql'))
  })

// Docker build: use db push only (skip migrations)
run('npx', ['prisma', 'db', 'push', '--skip-generate'])
