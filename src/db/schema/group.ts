import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'
import { nanoid } from 'nanoid'
import { users } from './user'

export const groups = sqliteTable('groups', {
  id: text('id', { mode: 'text' }).primaryKey().$defaultFn(() => nanoid(12)),
  leader: text('leader', { mode: 'text' }).references(() => users.id),
  papers: text('papers', { mode: 'json' }).$type<string[]>(),
  members: text('members', { mode: 'json' }).$type<string[]>(),
  archived: integer('archived', { mode: 'boolean' }).notNull().default(false),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
})
