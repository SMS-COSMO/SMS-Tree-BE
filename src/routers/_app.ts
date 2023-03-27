import { router } from "../trpc";
import { userRouter } from "./user";
import { publicProcedure } from "../trpc";

export const appRouter = router({
    status: publicProcedure.query(() => "Hola! This is working"),
    user: userRouter,
});

export type AppRouter = typeof appRouter;
