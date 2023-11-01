import { z } from 'zod'
import { TRPCError } from '@trpc/server'
import { protectedProcedure, requireRoles, router } from '../trpc'

export const groupRouter = router({
  create: protectedProcedure
    .input(z.object({
      leader: z.string()
        .min(4, { message: '组长ID长度应至少为4' })
        .max(24, { message: '组长ID超出长度范围' }),
      members: z
        .array(z
          .string()
          .min(4, { message: '用户ID长度应至少为4' })
          .max(24, { message: '用户ID超出长度范围' })
        )
        .min(1, '请填写组员ID')
        .max(64, '组员最多64人')
        .optional(),
      papers: z
        .array(z.string())
        .max(8, '小组最多8篇论文')
        .optional(),
      archived: z.boolean().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      // check if all members exist
      for (let user of input.members ?? []) {
        const res = await ctx.userController.userExist(user)
        if (!res.success)
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: res.message })
        else if (!res.res)
          throw new TRPCError({ code: 'BAD_REQUEST', message: `用户${user}不存在` })
      }

      const res = await ctx.groupController.create(input)
      if (!res.success || !res.id)
        throw new TRPCError({ code: 'BAD_REQUEST', message: res.message })

      // add group to users
      for (let user of input.members ?? []) {
        const r = await ctx.userController.addGroupToUser(user, res.id)
        if (!r.success)
          throw new TRPCError({ code: 'BAD_REQUEST', message: r.message })
      }

      return res.message
    }),
})
