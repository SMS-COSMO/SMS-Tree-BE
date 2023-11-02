import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'
import { nanoid } from 'nanoid'

export const groups = sqliteTable('groups', {
  id: text('id', { mode: 'text' }).primaryKey().$defaultFn(() => nanoid(12)),
  leader: text('leader', { mode: 'text' }),
  paper: text('paper', { mode: 'json' }).notNull().$type<string[]>().default([]),
  archived: integer('archived', { mode: 'boolean' }).notNull().default(false),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
})
