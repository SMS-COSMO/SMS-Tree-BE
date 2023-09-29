import { publicProcedure, router } from '../trpc'
import { userRouter } from './user'

export const appRouter = router({
  status: publicProcedure.query(() => 'Hola! This is working'),
  user: userRouter,
})

export type AppRouter = typeof appRouter
