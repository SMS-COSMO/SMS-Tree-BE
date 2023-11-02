import type { TRawGroup } from '../db/db'

export type TGroup = ReturnType<typeof groupSerializer>

export function groupSerializer(content: TRawGroup, members: string[], papers: string[]) {
  return {
    id: content.id,
    archived: content.archived,
    leader: content.leader,
    members,
    papers,
    createdAt: content.createdAt,
  }
}
