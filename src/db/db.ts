// db.ts
import { createInsertSchema, createSelectSchema } from 'drizzle-zod'
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js'
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import type { InferModel } from 'drizzle-orm'
import { env } from '../env'
import type { refreshTokens } from './schema/user'
import { users } from './schema/user'

// create the connection
const poolConnection = postgres(env.DATABASE_URL)
export const db: PostgresJsDatabase = drizzle(poolConnection)
export const selectUserSchema = createSelectSchema(users)
export const insertUserSchema = createInsertSchema(users)

export type TUser = InferModel<typeof users> // return type when queried
export type TNewUser = InferModel<typeof users, 'insert'>
export type TRefreshToken = InferModel<typeof refreshTokens, 'insert'>
