import { TRPCError } from '@trpc/server'
import { z } from 'zod'
import { publicProcedure, requireRoles, router } from '../trpc'

export const userRouter = router({
  register: publicProcedure
    .meta({ description: '@require 需要用户具有 teacher 或 admin 的身份' })
    .use(requireRoles(['teacher', 'admin']))
    .input(z.object({
      id: z.string().min(4, { message: '用户ID长度应至少为4' }).max(24, { message: '用户ID超出长度范围' }),
      role: z.enum(['student', 'teacher', 'admin'], { errorMap: () => ({ message: '提交了不存在的用户身份' }) }),
      username: z.string().min(2, { message: '用户名长度应至少为2' }).max(15, { message: '用户名超出长度范围' }),
      password: z.string().min(8, { message: '用户密码长度应至少为8' }),
    }))
    .mutation(async ({ ctx, input }) => {
      const result = await ctx.userController.register({ id: input.id, username: input.username, password: input.password, role: input.role })
      if (!result.success)
        throw new TRPCError({ code: 'BAD_REQUEST', message: result.message })
      else return result
    }),

  login: publicProcedure
    .meta({ description: '@return {userId: string; username: string; role: "admin" | "student" | "teacher"; accessToken: string; refreshToken: string;}' })
    .input(z.object({ id: z.string(), password: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.userController.login(input.id, input.password)
      if (!user)
        throw new TRPCError({ code: 'BAD_REQUEST', message: '用户名或密码错误' })
      return user
    }),

  refreshAccessToken: publicProcedure
    .meta({ description: '@return { accessToken: newAccessToken, refreshToken: newRefreshToken }' })
    .input(z.object({ username: z.string(), refreshToken: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const result = await ctx.userController.refreshAccessToken(input.refreshToken, input.username)
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
      const res = await ctx.userController.bulkRegister(input.users, input.randomPassword)
      if (!res.success)
        throw new TRPCError({ code: 'BAD_REQUEST', message: res.message })
      else
        return res.message
    }),

  profile: publicProcedure
    .meta({ description: `
      @return {
        id: string;
        username: string;
        role: "admin" | "student" | "teacher";
        createdAt: Date;
      }
    ` })
    .input(z.object({ id: z.string().min(1, { message: '用户不存在' }) }))
    .query(async ({ ctx, input }) => {
      const res = await ctx.userController.getProfile(input.id)
      if (!res.res || !res.success)
        throw new TRPCError({ code: 'BAD_REQUEST', message: res.message })
      else
        return res.res
    }),

  studentList: publicProcedure
    .meta({ description: `
      @require 需要用户具有 teacher 或 admin 的身份
      @return [{
        id: string;
        username: string;
        role: "admin" | "student" | "teacher";
        createdAt: Date;
      }, ...]
    ` })
    .use(requireRoles(['teacher', 'admin']))
    .query(async ({ ctx }) => {
      const res = await ctx.userController.getStudentList()
      if (!res.res || !res.success)
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: res.message })
      else
        return res.res
    }),
})
