import { LibsqlError } from '@libsql/client'
import bcrypt from 'bcrypt'
import { nanoid } from 'nanoid'
import { and, eq } from 'drizzle-orm'
import type { CreateExpressContextOptions } from '@trpc/server/adapters/express'
import type { TNewUser } from '../db/db'
import { db } from '../db/db'
import { refreshTokens, users } from '../db/schema/user'
import { Auth } from '../utils/auth'
import { userSerializer } from '../serializer/user'

export class UserController {
  private auth: Auth

  constructor() {
    this.auth = new Auth()
  }

  async getUserFromHeader(req: CreateExpressContextOptions['req']) {
    if (!req.headers.authorization)
      return undefined
    const result = await this.auth.getUserFromToken(req.headers.authorization)
    if (result.err)
      return undefined
    return result.user
  }

  async register(newUser: {
    id: string
    username: string
    password: string
    role: 'student' | 'admin' | 'teacher'
  }) {
    const { id, username, password, role = 'student' } = newUser
    const hash = await bcrypt.hash(password, 8)
    const user = { id, username, password: hash, role }
    try {
      await db.insert(users).values(user)
      return { success: true, message: '注册成功！' }
    }
    catch (err) {
      if (err instanceof LibsqlError && err.code === 'SQLITE_CONSTRAINT_PRIMARYKEY')
        return { success: false, message: '用户ID出现重复' }
      else return { success: false, message: '服务器内部错误' }
    }
  }

  async bulkRegister(inputUsers: { id: string; username: string }[], randomPassword?: boolean) {
    const newUsers = await Promise.all(inputUsers.map(async ({ username, id }) => {
      const password = randomPassword ? await bcrypt.hash(nanoid(12), 8) : await bcrypt.hash(id, 8)
      return {
        id,
        role: 'student',
        password,
        username,
      } as TNewUser
    }))
    await db.insert(users).values(newUsers)
  }

  async login(id: string, password: string) {
    const user = (await db.select().from(users).where(eq(users.id, id)))[0]
    if (!(user && (await bcrypt.compare(password, user.password))))
      return
    const accessToken = await this.auth.produceAccessToken(user.id)
    const refreshToken = await this.auth.produceRefreshToken(user.id)
    return { userId: user.id, username: user.username, accessToken, refreshToken }
  }

  async refreshAccessToken(refreshToken: string, id: string) {
    const token = await db
      .delete(refreshTokens)
      .where(and(eq(refreshTokens.token, refreshToken), eq(refreshTokens.owner, id)))
      .returning()
    if (!token[0])
      return
    const newRefreshToken = await this.auth.produceRefreshToken(id)
    const newAccessToken = await this.auth.produceAccessToken(id)
    return { accessToken: newAccessToken, refreshToken: newRefreshToken }
  }

  async getProfile(id: string) {
    try {
      const user = (await db.select().from(users).where(eq(users.id, id)))[0]
      return { success: true, res: userSerializer(user) }
    }
    catch (err) {
      return { success: false, message: '用户不存在' }
    }
  }

  async getList() {
    try {
      let res: Array<unknown> = [];
      (await db.select().from(users).all()).forEach(user => {
        res.push(userSerializer(user))
      })

      return { success: true, res: res }
    }
    catch (err) {
      return { success: false, message: '服务器内部错误' }
    }
  }
}
