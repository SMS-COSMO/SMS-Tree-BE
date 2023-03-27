import { initTRPC } from "@trpc/server";
import { Context } from "./context";
import superjson from "superjson";

// created for each request
const t = initTRPC.context<Context>().create({ transformer: superjson });

export const router = t.router;
export const middleware = t.middleware;
export const publicProcedure = t.procedure;
