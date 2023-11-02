import type { TRawGroup } from '../db/db'

export type TGroup = ReturnType<typeof groupSerializer>

export function groupSerializer(content: TRawGroup, members: string[]) {
  return {
    id: content.id,
    archived: content.archived,
    leader: content.leader,
    members,
    createdAt: content.createdAt,
  }
}
