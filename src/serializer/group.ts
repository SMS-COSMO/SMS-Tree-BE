import type { TRawGroup } from '../db/db'

export type TGroup = ReturnType<typeof groupSerializer>

export function groupSerializer(group: TRawGroup) {
  return {
    id: group.id,
    archived: group.archived,
    leader: group.leader,
    papers: group.papers,
    members: group.members,
    createdAt: group.createdAt,
  }
}
