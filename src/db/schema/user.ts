import { pgTable, serial, timestamp, varchar } from 'drizzle-orm/pg-core'
import { nanoid } from 'nanoid'

export const users = pgTable('users', {
  id: varchar('id', { length: 255 }).primaryKey().$defaultFn(() => nanoid(12)),
  username: varchar('username', { length: 64 }).notNull(),
  password: varchar('password', { length: 128 }).notNull(),
  role: varchar('role', { enum: ['admin', 'student', 'teacher'], length: 32 }).notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
})

export const refreshTokens = pgTable('refresh_tokens', {
  id: serial('id').primaryKey(),
  token: varchar('token', { length: 1024 }).notNull(),
  owner: varchar('owner')
    .references(() => users.id)
    .notNull(),
})
