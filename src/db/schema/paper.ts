import { varchar, timestamp, serial, pgTable, integer, text } from "drizzle-orm/pg-core";

export const papers = pgTable("papers", {
    id: serial("id").primaryKey(),
    title: varchar("title", { length: 64 }).notNull(),
    keywords: text("keywords").notNull(),
    abstract: text("abstract").notNull(),
    authorGroupId: integer("author_group_id").notNull(),
    status: integer("status").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    S3FileId: text("s3_file_id").notNull()
});
