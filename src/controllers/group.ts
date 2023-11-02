import { eq } from 'drizzle-orm'
import { db } from '../db/db'
import { groups } from '../db/schema/group'
import type { TGroup } from '../serializer/group'
import { groupSerializer } from '../serializer/group'
import { usersToGroups } from '../db/schema/userToGroup'

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
      archived: archived ?? false,
    }

    try {
      const insertedId = (await db.insert(groups).values(group).returning({ id: groups.id }))[0].id
      if (members?.length)
        await db.insert(usersToGroups).values(members.map(item => ({
          groupId: insertedId,
          userId: item
        })))
      return { success: true, message: '创建成功' }
    }
    catch (err) {
      return { success: false, message: '服务器内部错误' }
    }
  }

  async remove(id: string) {
    try {
      await db.delete(groups).where(eq(groups.id, id))
      await db.delete(usersToGroups).where(eq(usersToGroups.groupId, id))
      return { success: true, message: '删除成功' }
    }
    catch (err) {
      return { success: false, message: '小组不存在' }
    }
  }

  async getContent(id: string) {
    try {
      const content = (await db.select().from(groups).where(eq(groups.id, id)))[0]
      const members = (
        await db.select().from(usersToGroups)
          .where(eq(usersToGroups.groupId, id))
      ).map(item => item.userId)
      const group = groupSerializer(content, members)
      return { success: true, res: group, message: '查询成功' }
    }
    catch (err) {
      return { success: false, message: '小组不存在' }
    }
  }

  async getList() {
    try {
      const res: Array<TGroup> = [];
      (await db.select().from(groups)).forEach(async content => {
        const groupMembers = (
          await db.select().from(usersToGroups)
            .where(eq(usersToGroups.groupId, content.id))
        ).map(item => item.userId)
        res.push(groupSerializer(content, groupMembers))
      })

      return { success: true, res, message: '查询成功' }
    }
    catch (err) {
      return { success: false, message: '服务器内部错误' }
    }
  }
}