import type { TRawUser } from '../db/db'

export type TUser = ReturnType<typeof userSerializer>

export function userSerializer(content: TRawUser, groupIds: string[]) {
  return {
    id: content.id,
    username: content.username,
    role: content.role,
    createdAt: content.createdAt,
    groupIds: groupIds,
  }
}
