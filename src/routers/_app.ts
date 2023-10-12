import { publicProcedure, router } from '../trpc'
import { paperRouter } from './paper'
import { userRouter } from './user'

export const appRouter = router({
  status: publicProcedure.query(() => 'Hola! This is working'),
  user: userRouter,
  paper: paperRouter,
})

export type AppRouter = typeof appRouter
