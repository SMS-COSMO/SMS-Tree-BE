import { PrismaClient } from "@prisma/client";
import { SupabaseClient, UserResponse } from "@supabase/supabase-js";
// import { Session } from "@supabase/gotrue-js/src/lib/types";
import * as trpcExpress from "@trpc/server/adapters/express";
import { env } from "./env";
import { inferAsyncReturnType } from "@trpc/server";

const newGlobal = global as typeof global & {
    prisma?: PrismaClient;
    supabase?: SupabaseClient;
};

// initiates prisma client and supabase client
const prisma: PrismaClient =
    newGlobal.prisma ||
    new PrismaClient({
        log: env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
    });

// if (env.NODE_ENV !== "production") {
//     newGlobal.prisma = prisma;
// }

const supabase: SupabaseClient = newGlobal.supabase || new SupabaseClient(env.SUPABASE_URL, env.SUPABASE_KEY);

type CreateContextOptions = {
    session?: UserResponse;
};

/**
 * This helper generates the "internals" for a tRPC context. If you need to use
 * it, you can export it from here
 *
 * Examples of things you may need it for:
 * - testing, so we dont have to mock Next.js' req/res
 * - trpc's `createSSGHelpers` where we don't have req/res
 * @credits https://create.t3.gg/en/usage/trpc#-servertrpccontextts'
 */
export const createInnerContext = (opts: CreateContextOptions) => {
    return {
        session: opts.session,
        prisma,
        supabase,
    };
};

/**
 * This is the actual context you'll use in your router. It will be used to
 * process every request that goes through your tRPC endpoint
 * @link https://trpc.io/docs/context
 */
export const createContext = async (opts: trpcExpress.CreateExpressContextOptions) => {
    const { req, res } = opts;

    // Get the session from the server using the unstable_getServerSession wrapper function
    const session = await supabase.auth.getUser();

    return createInnerContext({
        session,
    });
};

export type Context = inferAsyncReturnType<typeof createContext>;
