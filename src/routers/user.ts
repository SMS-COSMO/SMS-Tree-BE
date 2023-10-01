import { TRPCError } from '@trpc/server'
import { z } from 'zod'
import { publicProcedure, requireRoles, router } from '../trpc'

export const userRouter = router({
  register: publicProcedure
    .meta({ description: '!!现在此功能仅供测试 会创建身份为 teacher 的账户!!' })
    .input(z.object({ id: z.string().max(12), username: z.string().max(12), password: z.string().min(8) }))
    .mutation(async ({ ctx, input }) => {
      await ctx.auth.register({ role: 'teacher', id: input.id, username: input.username, password: input.password })
    }),
  login: publicProcedure
    .meta({ description: '@return {userId: string; accessToken: string; refreshToken: string;}' })
    .input(z.object({ id: z.string(), password: z.string().min(8) }))
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.auth.login(input.id, input.password)
      if (!user)
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'Please check your credentials.' })
      return user
    }),
  refreshAccessToken: publicProcedure
    .meta({ description: '@return { accessToken: newAccessToken, refreshToken: newRefreshToken }' })
    .input(z.object({ username: z.string(), refreshToken: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const result = await ctx.auth.refreshAccessToken(input.refreshToken, input.username)
      if (!result)
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'Incorrect refresh token.' })
      return result
    }),
  bulkRegister: publicProcedure
    .meta({ description: `
      @require 需要用户具有 teacher 或 admin 的身份
      @return 无返回值
    ` })
    .use(requireRoles(['teacher', 'admin']))
    .input(z.object({
      users: z.object({ id: z.string().length(24), username: z.string().min(1) }).array().nonempty(),
      randomPassword: z.boolean().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      await ctx.auth.bulkRegister(input.users, input.randomPassword)
    }),
})
