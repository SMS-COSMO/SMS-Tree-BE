import { router, publicProcedure } from "../trpc";
export const testRouter = router({
    hi: publicProcedure.query(() => "hello"),
});
