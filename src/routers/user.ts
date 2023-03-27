import { router, publicProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

// let me explain: because supabase doesn't allows sign up with only username
// so I have to use a little trick to bypass limitation
// the email is fake and should be something like 20225300001@shenzhong.tk
// the real username is stored in `options: { data: { username: input.username } }`
// the domain shenzhong.tk belongs to me so it's likely to be safe
export const userRouter = router({
    register: publicProcedure
        .input(z.object({ username: z.string(), password: z.string().min(8) }))
        .mutation(async ({ ctx, input }) => {
            let result = await ctx.supabase.auth.signUp({
                email: input.username + "@shenzhong.tk",
                password: input.password,
                options: { data: { username: input.username } },
            });
            console.log(result);
            if (result.error) {
                throw new TRPCError({ code: "BAD_REQUEST", message: result.error.message });
            }
            return result.data;
        }),
    login: publicProcedure
        .input(z.object({ username: z.string(), password: z.string().min(8) }))
        .mutation(async ({ ctx, input }) => {
            let result = await ctx.supabase.auth.signInWithPassword({
                email: input.username + "@shenzhong.tk",
                password: input.password,
            });
            if (result.error) {
                throw new TRPCError({ code: "BAD_REQUEST", message: result.error.message });
            }
            return result.data;
        }),
});
