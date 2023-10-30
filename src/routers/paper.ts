import { z } from 'zod'
import { TRPCError } from '@trpc/server'
import { protectedProcedure, router } from '../trpc'

export const paperRouter = router({
  create: protectedProcedure
    .input(z.object({
      title: z.string().min(1, { message: '请输入论文标题' }).max(256, { message: '论文标题长度不应超过 256' }),
      keywords: z.array(z.string().max(8, { message: '关键词最长为8个字符' })).max(8, { message: '最多8个关键词' }),
      abstract: z.string(),
      authorGroupId: z.string().min(1, '无效作者组'),
      canDownload: z.boolean(),
      S3FileId: z.string().min(1, '请上传文件'),
    }))
    .mutation(async ({ ctx, input }) => {
      const res = await ctx.paperController.create(input)
      if (!res.success)
        throw new TRPCError({ code: 'BAD_REQUEST', message: res.message })
      else
        return res.message
    }),

  content: protectedProcedure
    .input(z.object({ id: z.string().min(1, '论文id不存在') }))
    .query(async ({ ctx, input }) => {
      const res = await ctx.paperController.getContent(input.id)
      if (!res.res || !res.success)
        throw new TRPCError({ code: 'BAD_REQUEST', message: res.message })
      else
        return res.res
    }),

  list: protectedProcedure
    .query(async ({ ctx }) => {
      const res = await ctx.paperController.getList()
      if (!res.res || !res.success)
        throw new TRPCError({ code: 'BAD_REQUEST', message: res.message })
      else
        return res.res
    }),

  file: protectedProcedure
    .input(z.object({ id: z.string().min(1, '论文id不存在') }))
    .query(async ({ ctx, input }) => {
      const res = await ctx.paperController.getFile(input.id, ctx.user.role)
      if (!res.res || !res.success)
        throw new TRPCError({ code: 'BAD_REQUEST', message: res.message })
      else
        return res.res
    }),
})
