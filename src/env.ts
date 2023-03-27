import * as dotenv from "dotenv";
import { z } from "zod";
dotenv.config();
const envSchema = z.object({
    DATABASE_URL: z.string().url(),
    SUPABASE_URL: z.string(),
    SUPABASE_KEY: z.string(),
    NODE_ENV: z.enum(["development", "test", "production"]),
});

const envParse = envSchema.safeParse(process.env);

if (!envParse.success) {
    console.error("[ERROR] Invalid environment variables:", JSON.stringify(envParse.error.format(), null, 4));
    process.exit(1);
}
export const env = envParse.data;
