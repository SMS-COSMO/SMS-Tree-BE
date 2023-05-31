import * as trpcExpress from "@trpc/server/adapters/express";
import { inferAsyncReturnType } from "@trpc/server";
import { db } from "./db/db";
import { Auth } from "./utils/auth";
import { s3 } from "./utils/s3";

declare global {
    var auth: Auth | undefined;
}
const auth = global.auth || new Auth();
global.auth = auth;

type CreateContextOptions = {
    user?: string;
};

/**
 * This helper generates the "internals" for a tRPC context. If you need to use
 * it, you can export it from here
 * @credits https://create.t3.gg/en/usage/trpc#-servertrpccontextts'
 */
export const createInnerContext = (opts: CreateContextOptions) => {
    return {
        user: opts.user,
        db: db,
        auth: auth,
        s3: s3,
    };
};

/**
 * This is the actual context you'll use in your router. It will be used to
 * process every request that goes through your tRPC endpoint
 * @link https://trpc.io/docs/context
 */
export const createContext = async (opts: trpcExpress.CreateExpressContextOptions) => {
    const { req } = opts;
    const user = await auth.getUserFromHeader(req);
    return createInnerContext({ user });
};

export type Context = inferAsyncReturnType<typeof createContext>;
