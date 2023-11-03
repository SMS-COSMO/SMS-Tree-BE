import { LibsqlError } from '@libsql/client';
import bcrypt from 'bcrypt';
import { nanoid } from 'nanoid';
import { and, eq } from 'drizzle-orm';
import type { CreateExpressContextOptions } from '@trpc/server/adapters/express';
import type { TNewUser } from '../db/db';
import { db } from '../db/db';
import { refreshTokens, users } from '../db/schema/user';
import { Auth } from '../utils/auth';
import { type TUser, userSerializer } from '../serializer/user';
import { usersToGroups } from '../db/schema/userToGroup';

export class UserController {
  private auth: Auth;

  constructor() {
    this.auth = new Auth();
  }

  async getUserFromHeader(req: CreateExpressContextOptions['req']) {
    if (!req.headers.authorization)
      return undefined;
    const result = await this.auth.getUserFromToken(req.headers.authorization);
    if (result.err)
      return undefined;
    return result.user;
  }

  async register(newUser: TNewUser & { groupIds?: string[] }) {
    const { id, username, password, role, groupIds } = newUser;
    const hash = await bcrypt.hash(password, 8);
    const user = { id, username, password: hash, role };
    try {
      const insertedId = (await db.insert(users).values(user).returning({ id: users.id }))[0].id;
      if (groupIds?.length) {
        await db.insert(usersToGroups).values(
          groupIds.map(item => ({
            userId: insertedId,
            groupId: item,
          })),
        );
      }
      return { success: true, message: '注册成功！' };
    }
    catch (err) {
      if (err instanceof LibsqlError && err.code === 'SQLITE_CONSTRAINT_PRIMARYKEY')
        return { success: false, message: '用户ID出现重复' };
      else return { success: false, message: '服务器内部错误' };
    }
  }

  async bulkRegister(inputUsers: { id: string; username: string }[], randomPassword?: boolean) {
    if ((new Set(inputUsers.map(user => user.id))).size !== inputUsers.length)
      return { success: false, message: '用户ID出现重复' };

    for (const user of inputUsers) {
      if ((await db.select().from(users).where(eq(users.id, user.id))).length > 0)
        return { success: false, message: '用户ID出现重复' };
    }

    const newUsers = await Promise.all(inputUsers.map(async ({ id, username }) => {
      const password = randomPassword ? await bcrypt.hash(nanoid(12), 8) : await bcrypt.hash(id, 8);
      return {
        id,
        role: 'student',
        password,
        username,
        groupIds: [],
      } as TNewUser & { groupIds: string[] };
    }));
    await db.insert(users).values(newUsers);

    return { success: true, message: '创建成功！' };
  }

  async login(id: string, password: string) {
    const user = (await db.select().from(users).where(eq(users.id, id)))[0];
    if (!(user && (await bcrypt.compare(password, user.password))))
      return;
    const accessToken = await this.auth.produceAccessToken(user.id);
    const refreshToken = await this.auth.produceRefreshToken(user.id);
    return { userId: user.id, username: user.username, role: user.role, accessToken, refreshToken };
  }

  async refreshAccessToken(refreshToken: string, id: string) {
    const token = await db
      .delete(refreshTokens)
      .where(and(eq(refreshTokens.token, refreshToken), eq(refreshTokens.owner, id)))
      .returning();
    if (!token[0])
      return;
    const newRefreshToken = await this.auth.produceRefreshToken(id);
    const newAccessToken = await this.auth.produceAccessToken(id);
    return { accessToken: newAccessToken, refreshToken: newRefreshToken };
  }

  async getProfile(id: string) {
    try {
      const content = (await db.select().from(users).where(eq(users.id, id)))[0];
      const groupIds = (
        await db.select().from(usersToGroups)
          .where(eq(usersToGroups.userId, content.id))
      ).map(item => item.groupId);
      return { success: true, res: userSerializer(content, groupIds) };
    }
    catch (err) {
      return { success: false, message: '用户不存在' };
    }
  }

  async getStudentList() {
    try {
      const res: Array<TUser> = [];
      for (const content of await db.select().from(users).where(eq(users.role, 'student'))) {
        const groupIds = (
          await db.select().from(usersToGroups)
            .where(eq(usersToGroups.userId, content.id))
        ).map(item => item.groupId);
        res.push(userSerializer(content, groupIds));
      }

      return { success: true, res };
    }
    catch (err) {
      return { success: false, message: '服务器内部错误' };
    }
  }

  async remove(id: string) {
    try {
      await db.delete(users).where(eq(users.id, id));
      await db.delete(usersToGroups).where(eq(usersToGroups.userId, id));
      return { success: true, message: '删除成功' };
    }
    catch (err) {
      return { success: false, message: '用户不存在' };
    }
  }
}
