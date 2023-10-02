import { TRPCError } from '@trpc/server'
import { z } from 'zod'
import { publicProcedure, requireRoles, router } from '../trpc'

export const userRouter = router({
  register: publicProcedure
    .meta({ description: '@require 需要用户具有 teacher 或 admin 的身份' })
    .use(requireRoles(['teacher', 'admin']))
    .input(z.object({
      id: z.string().max(24, { message: '用户ID超出长度范围' }),
      role: z.enum(['student', 'teacher', 'admin']),
      username: z.string().max(15, { message: '用户名超出长度范围' }),
      password: z.string().min(8, { message: '用户密码长度应至少为8' }),
    }))
    .mutation(async ({ ctx, input }) => {
      const result = await ctx.auth.register({ id: input.id, username: input.username, password: input.password, role: input.role })
      if (!result.success)
        throw new TRPCError({ code: 'BAD_REQUEST', message: result.message })
      else return result
    }),
  login: publicProcedure
    .meta({ description: '@return {userId: string; username: string; accessToken: string; refreshToken: string;}' })
    .input(z.object({ id: z.string(), password: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.auth.login(input.id, input.password)
      if (!user)
        throw new TRPCError({ code: 'BAD_REQUEST', message: '用户名或密码错误' })
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
      users: z.object({ id: z.string().min(1).max(24), username: z.string().min(1) }).array().nonempty(),
      randomPassword: z.boolean().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      await ctx.auth.bulkRegister(input.users, input.randomPassword)
    }),
})
