import { TRPCError, initTRPC } from '@trpc/server'
import superjson from 'superjson'
import type { TRPCPanelMeta } from 'trpc-panel'
import type { Context } from './context'

// created for each request
const t = initTRPC.context<Context>().meta<TRPCPanelMeta>().create({ transformer: superjson })

export const router = t.router
export const middleware = t.middleware
export const publicProcedure = t.procedure

export const enforceUserIsAuthed = t.middleware(({ ctx, next }) => {
  if (!ctx.user)
    throw new TRPCError({ code: 'UNAUTHORIZED', message: '用户未登录' })

  return next({ ctx: {
    user: ctx.user,
  } })
})

export function requireRoles(roles: string[]) {
  // `unstable_` means this is a new API but it's safe to use
  //  @see https://trpc.io/docs/server/middlewares#extending-middlewares
  return enforceUserIsAuthed.unstable_pipe(({ ctx, next }) => {
    if (!roles.includes(ctx.user.role))
      throw new TRPCError({ code: 'UNAUTHORIZED', message: '超出权限范围' })
    return next({ ctx: {
      user: ctx.user,
    } })
  })
}
