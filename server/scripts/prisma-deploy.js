import { existsSync, readdirSync, statSync } from 'fs'
import { join } from 'path'
import { spawnSync } from 'child_process'

const run = (command, args) => {
  const env = {
    ...process.env,
    DIRECT_URL: process.env.DIRECT_URL || process.env.DATABASE_URL || '',
  }
  const result = spawnSync(command, args, { stdio: 'inherit', shell: process.platform === 'win32', env })
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

if (hasMigrations) {
  run('npx', ['prisma', 'migrate', 'deploy'])
} else {
  run('npx', ['prisma', 'db', 'push', '--skip-generate'])
}
