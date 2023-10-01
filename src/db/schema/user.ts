import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'
import { nanoid } from 'nanoid'

// export const users = pgTable('users', {
//   id: varchar('id', { length: 255 }).primaryKey().$defaultFn(() => nanoid(12)),
//   username: varchar('username', { length: 64 }).notNull(),
//   password: varchar('password', { length: 128 }).notNull(),
//   role: varchar('role', { enum: ['admin', 'student', 'teacher'], length: 32 }).notNull(),
//   createdAt: timestamp('created_at').notNull().defaultNow(),
// })
export const users = sqliteTable('users', {
  id: text('id', { mode: 'text' }).primaryKey().$defaultFn(() => nanoid(12)),
  username: text('username', { mode: 'text' }).notNull(),
  password: text('password', { mode: 'text' }).notNull(),
  role: text('role', { enum: ['admin', 'student', 'teacher'] }).notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
})

// export const refreshTokens = pgTable('refresh_tokens', {
//   id: serial('id').primaryKey(),
//   token: varchar('token', { length: 1024 }).notNull(),
//   owner: varchar('owner')
//     .references(() => users.id)
//     .notNull(),
// })
export const refreshTokens = sqliteTable('refresh_tokens', {
  id: text('id', { mode: 'text' }).primaryKey().$defaultFn(() => nanoid(12)),
  token: text('token', { mode: 'text' }).notNull(),
  owner: text('owner', { mode: 'text' })
    .references(() => users.id)
    .notNull(),
})
