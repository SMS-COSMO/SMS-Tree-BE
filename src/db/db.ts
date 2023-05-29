// db.ts
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { drizzle, PostgresJsDatabase } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { refreshTokens, users } from "./schema/user";
import { env } from "../env";
import { InferModel, eq } from "drizzle-orm";

// create the connection
const poolConnection = postgres(env.DATABASE_URL);
export const db: PostgresJsDatabase = drizzle(poolConnection);
export const selectUserSchema = createSelectSchema(users);
export const insertUserSchema = createInsertSchema(users);

export type TUser = InferModel<typeof users>; // return type when queried
export type TNewUser = InferModel<typeof users, "insert">;
export type TRefreshToken = InferModel<typeof refreshTokens, "insert">;
