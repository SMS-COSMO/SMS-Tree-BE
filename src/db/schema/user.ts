import { integer, varchar, timestamp, serial, pgTable } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
    id: serial("id").primaryKey(),
    username: varchar("username", { length: 64 }).notNull(),
    password: varchar("password", { length: 128 }).notNull(),
    role: varchar("role", { enum: ["admin", "student", "teacher"], length: 32 }).notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const refreshTokens = pgTable("refresh_tokens", {
    id: serial("id").primaryKey(),
    token: varchar("token", { length: 1024 }).notNull(),
    owner: integer("owner")
        .references(() => users.id)
        .notNull(),
});
