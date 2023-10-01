// import { integer, pgTable, serial, text, timestamp, varchar } from 'drizzle-orm/pg-core'
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'
import { nanoid } from 'nanoid'

// export const papers = pgTable('papers', {
//   id: serial('id').primaryKey(),
//   title: varchar('title', { length: 64 }).notNull(),
//   keywords: text('keywords').notNull(),
//   abstract: text('abstract').notNull(),
//   authorGroupId: integer('author_group_id').notNull(),
//   status: integer('status').notNull(),
//   rate: integer('rate').notNull().default(0),
//   createdAt: timestamp('created_at').notNull().defaultNow(),
//   S3FileId: text('s3_file_id').notNull(),
// })
export const papers = sqliteTable('papers', {
  id: text('id', { mode: 'text' }).primaryKey().$defaultFn(() => nanoid(12)),
  title: text('title', { mode: 'text' }).notNull(),
  keywords: text('keywords', { mode: 'text' }).notNull(),
  abstract: text('abstract', { mode: 'text' }).notNull(),
  authorGroupId: text('author_group_id', { mode: 'text' }).notNull(),
  status: integer('status').notNull(),
  rate: integer('rate').notNull().default(0),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  S3FileId: text('s3_file_id', { mode: 'text' }).notNull(),
})
