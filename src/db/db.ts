// db.ts
import { createInsertSchema, createSelectSchema } from 'drizzle-zod'
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js'
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import { env } from '../env'
import type { refreshTokens } from './schema/user'
import { users } from './schema/user'

// create the connection
const poolConnection = postgres(env.DATABASE_URL)
export const db: PostgresJsDatabase = drizzle(poolConnection)
export const selectUserSchema = createSelectSchema(users)
export const insertUserSchema = createInsertSchema(users)

export type TUser = typeof users.$inferSelect
export type TNewUser = typeof users.$inferInsert
export type TRefreshToken = typeof refreshTokens.$inferInsert
