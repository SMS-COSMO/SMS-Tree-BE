import { router, publicProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

export const userRouter = router({
    register: publicProcedure
        .meta({ description: `@return void\n只实现注册功能，注册完后需要登陆` })
        .input(z.object({ username: z.string().max(20), password: z.string().min(8) }))
        .mutation(async ({ ctx, input }) => {
            await ctx.auth.register(input.username, input.password);
        }),
    login: publicProcedure
        .meta({ description: `@return {username: string; accessToken: string; refreshToken: string;}` })
        .input(z.object({ username: z.string(), password: z.string().min(8) }))
        .mutation(async ({ ctx, input }) => {
            let user = await ctx.auth.login(input.username, input.password);
            if (!user) throw new TRPCError({ code: "BAD_REQUEST", message: "Please check your credentials." });
            return user;
        }),
    refreshAccessToken: publicProcedure
        .meta({ description: `@return { accessToken: newAccessToken, refreshToken: newRefreshToken }` })
        .input(z.object({ username: z.string(), refreshToken: z.string() }))
        .mutation(async ({ ctx, input }) => {
            let result = await ctx.auth.refreshAccessToken(input.refreshToken, input.username);
            if (!result) throw new TRPCError({ code: "BAD_REQUEST", message: "Incorrect refresh token." });
            return result;
        }),
});
