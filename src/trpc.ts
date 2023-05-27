import { initTRPC } from "@trpc/server";
import { Context } from "./context";
import superjson from "superjson";
import { TRPCPanelMeta } from "trpc-panel";

// created for each request
const t = initTRPC.context<Context>().meta<TRPCPanelMeta>().create({ transformer: superjson });

export const router = t.router;
export const middleware = t.middleware;
export const publicProcedure = t.procedure;
