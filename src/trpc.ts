import { initTRPC } from '@trpc/server'
import superjson from 'superjson'
import type { TRPCPanelMeta } from 'trpc-panel'
import type { Context } from './context'

// created for each request
const t = initTRPC.context<Context>().meta<TRPCPanelMeta>().create({ transformer: superjson })

export const router = t.router
export const middleware = t.middleware
export const publicProcedure = t.procedure
