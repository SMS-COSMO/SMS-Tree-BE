import type { TRawUser } from '../db/db'

export type TUser = ReturnType<typeof userSerializer>

export function userSerializer(user: TRawUser) {
  return {
    id: user.id,
    username: user.username,
    role: user.role,
    createdAt: user.createdAt,
    groupIds: user.groupIds,
  }
}
