import { z } from 'zod'
import { publicProcedure, requireRoles, router } from '../trpc'
import { TRPCError } from '@trpc/server'

export const paperRouter = router({
  create: publicProcedure
    .input(z.object({
      title: z.string(),
      keywords: z.string(),
      abstract: z.string(),
      authorGroupId: z.string(),
      S3FileId: z.string()
    }))
    .mutation(async ({ ctx, input }) => {
      const res = await ctx.paperController.create(input)
      if (!res.success)
        throw new TRPCError({ code: 'BAD_REQUEST', message: res.message })
      else
        return res.message
    }),

  content: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const res = await ctx.paperController.getContent(input.id)
      if (!res.res || !res.success)
        throw new TRPCError({ code: 'BAD_REQUEST', message: res.message })
      else
        return res.res
    }),

  list: publicProcedure
    .query(async ({ ctx }) => {
      const res = await ctx.paperController.getList()
      if (!res.res ||!res.success)
        throw new TRPCError({ code: 'BAD_REQUEST', message: res.message })
      else
        return res.res
    }),

  file: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const res = await ctx.paperController.getFile(input.id)
      if (!res.res || !res.success)
        throw new TRPCError({ code: 'BAD_REQUEST', message: res.message })
      else
        return res.res
    }),
})