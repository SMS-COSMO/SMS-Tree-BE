import process from 'node:process'
import type * as trpcExpress from '@trpc/server/adapters/express'
import type { inferAsyncReturnType } from '@trpc/server'
import { db } from './db/db'
import { Auth } from './utils/auth'
import { s3 } from './utils/s3'

const newGlobal = globalThis as unknown as { auth: Auth | undefined }
const auth = newGlobal.auth ?? new Auth()
if (process.env.NODE_ENV !== 'production')
  newGlobal.auth = auth

interface CreateContextOptions {
  user?: string
}

/**
 * This helper generates the "internals" for a tRPC context. If you need to use
 * it, you can export it from here
 * @credits https://create.t3.gg/en/usage/trpc#-servertrpccontextts'
 */
export function createInnerContext(opts: CreateContextOptions) {
  return {
    user: opts.user,
    db,
    auth,
    s3,
  }
}

/**
 * This is the actual context you'll use in your router. It will be used to
 * process every request that goes through your tRPC endpoint
 * @link https://trpc.io/docs/context
 */
export async function createContext(opts: trpcExpress.CreateExpressContextOptions) {
  const { req } = opts
  const user = await auth.getUserFromHeader(req)
  return createInnerContext({ user })
}

export type Context = inferAsyncReturnType<typeof createContext>
