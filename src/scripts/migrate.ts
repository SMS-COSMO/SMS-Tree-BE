import { drizzle } from 'drizzle-orm/postgres-js'
import { migrate } from 'drizzle-orm/postgres-js/migrator'
import postgres from 'postgres'
import { env } from '../env'

// for migrations
console.log(env.DATABASE_URL)
const migrationClient = postgres(env.DATABASE_URL, { max: 1 })
await migrate(drizzle(migrationClient), { migrationsFolder: 'drizzle' })
console.log('Migration completed!')
migrationClient.end()
