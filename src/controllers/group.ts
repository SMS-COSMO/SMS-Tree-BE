import { eq } from 'drizzle-orm'
import { db } from '../db/db'
import { groups } from '../db/schema/group'

export class GroupController {
  async create(newGroup: {
    leader: string
    members?: string[]
    papers?: string[]
    archived?: boolean
  }) {
    const { leader, members, papers, archived } = newGroup
    const group = {
      leader,
      members: members ?? [],
      papers: papers ?? [],
      archived: archived ?? false,
    }

    try {
      const id = (await db.insert(groups).values(group).returning({ id: groups.id }))[0].id
      return { success: true, id, message: '创建成功' }
    }
    catch (err) {
      return { success: false, message: '服务器内部错误' }
    }
  }

  async addUserToGroup(groupId: string, userId: string) {
    try {
      const selectedGroups = (
        await db
          .select({ members: groups.members })
          .from(groups).where(eq(groups.id, groupId))
      )
      if (selectedGroups.length === 0)
        return { success: false, message: '小组不存在' }

      let newMembers: string[] = selectedGroups[0].members ?? []
      newMembers.push(userId)
      await db.update(groups).set({ members: newMembers }).where(eq(groups.id, groupId))
      return { success: true, message: '添加成功' }
    }
    catch (err) {
      console.log(err)
      return { success: false, message: '服务器内部错误' }
    }
  }

  async groupExist(id: string) {
    try {
      return { success: true, res: (await db.select().from(groups).where(eq(groups.id, id))).length > 0 }
    }
    catch (err) {
      return { success: false, message: '服务器内部错误' }
    }
  }
}