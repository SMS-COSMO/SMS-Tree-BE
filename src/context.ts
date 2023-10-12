import process from 'node:process'
import type * as trpcExpress from '@trpc/server/adapters/express'
import type { inferAsyncReturnType } from '@trpc/server'
import { type TRawUser, db } from './db/db'
import { UserController } from './controllers/user'
import { s3 } from './controllers/s3'
import { PaperController } from './controllers/paper'

const newGlobal = globalThis as unknown as {
  userController: UserController | undefined
  paperController: PaperController | undefined
}

const userController = newGlobal.userController ?? new UserController()
const paperController = newGlobal.paperController ?? new PaperController()

if (process.env.NODE_ENV !== 'production') {
  newGlobal.userController = userController
  newGlobal.paperController = paperController
}

interface CreateContextOptions {
  user?: TRawUser
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
    userController,
    s3,
    paperController,
  }
}

/**
 * This is the actual context you'll use in your router. It will be used to
 * process every request that goes through your tRPC endpoint
 * @link https://trpc.io/docs/context
 */
export async function createContext(opts: trpcExpress.CreateExpressContextOptions) {
  const { req } = opts
  const user = await userController.getUserFromHeader(req)
  return createInnerContext({ user })
}

export type Context = inferAsyncReturnType<typeof createContext>
