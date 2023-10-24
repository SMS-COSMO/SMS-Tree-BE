import { z } from 'zod'
import { TRPCError } from '@trpc/server'
import { protectedProcedure, router } from '../trpc'

export const paperRouter = router({
  create: protectedProcedure
    .input(z.object({
      title: z.string().min(1, { message: '请输入论文标题' }).max(256, { message: '论文标题长度不应超过 256' }),
      keywords: z.string().array(),
      abstract: z.string(),
      authorGroupId: z.string().nonempty('无效作者组'),
      S3FileId: z.string().nonempty('请上传文件'),
    }))
    .mutation(async ({ ctx, input }) => {
      const res = await ctx.paperController.create(input)
      if (!res.success)
        throw new TRPCError({ code: 'BAD_REQUEST', message: res.message })
      else
        return res.message
    }),

  content: protectedProcedure
    .input(z.object({ id: z.string().nonempty('论文id不存在') }))
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
    .input(z.object({ id: z.string().nonempty('论文id不存在') }))
    .query(async ({ ctx, input }) => {
      const res = await ctx.paperController.getFile(input.id)
      if (!res.res || !res.success)
        throw new TRPCError({ code: 'BAD_REQUEST', message: res.message })
      else
        return res.res
    }),
})
