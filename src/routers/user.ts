import { TRPCError } from '@trpc/server'
import { z } from 'zod'
import { nanoid } from 'nanoid'
import { publicProcedure, requireRoles, router } from '../trpc'
import type { TNewUser } from '../db/db'
import { db } from '../db/db'
import { users } from '../db/schema/user'

const bulkRegisterOptions = z.object({ randomPassword: z.boolean() })

export const userRouter = router({
  register: publicProcedure
    .meta({ description: '@return void 只实现注册功能，注册完后需要登陆' })
    .input(z.object({ username: z.string().max(20), password: z.string().min(8) }))
    .mutation(async ({ ctx, input }) => {
      await ctx.auth.register({ role: 'student', username: input.username, password: input.password })
    }),
  login: publicProcedure
    .meta({ description: '@return {username: string; accessToken: string; refreshToken: string;}' })
    .input(z.object({ username: z.string(), password: z.string().min(8) }))
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.auth.login(input.username, input.password)
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
      users: z.object({ username: z.string().min(1), studentId: z.string().length(11) }).array().nonempty(),
      options: bulkRegisterOptions.optional(),
    }))
    .mutation(async ({ input }) => {
      const usersArray = input.users.map(({ username, studentId }) => {
        return {
          role: 'student',
          password: input.options?.randomPassword ? nanoid(12) : studentId,
          username,
        } as TNewUser
      })
      await db.insert(users).values(usersArray)
    }),
})
