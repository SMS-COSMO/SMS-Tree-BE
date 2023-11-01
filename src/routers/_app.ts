import { publicProcedure, router } from '../trpc'
import { groupRouter } from './group'
import { paperRouter } from './paper'
import { userRouter } from './user'

export const appRouter = router({
  status: publicProcedure.query(() => 'Hola! This is working'),
  user: userRouter,
  paper: paperRouter,
  group: groupRouter,
})

export type AppRouter = typeof appRouter
