import * as jose from 'jose'
import { nanoid } from 'nanoid'
import bcrypt from 'bcrypt'
import { and, eq } from 'drizzle-orm'
import { type CreateExpressContextOptions } from '@trpc/server/adapters/express'
import { db } from '../db/db'
import { refreshTokens, users } from '../db/schema/user'
import { env } from '../env'

const encode = TextEncoder.prototype.encode.bind(new TextEncoder())
const decode = TextDecoder.prototype.decode.bind(new TextDecoder())

const encPublicKey = await jose.importSPKI(env.ENC_PUBLIC_KEY, 'RSA-OAEP-256')
const signPrivateKey = await jose.importPKCS8(env.SIGN_PRIVATE_KEY, 'RS512')

// TODO: refactor Auth class
export class Auth {
  async produceAccessToken(id: string) {
    const jwt = await new jose.SignJWT({})
      .setSubject(id.toString())
      .setIssuedAt()
      .setExpirationTime('24h')
      .setIssuer('sms-tree')
      .setJti(nanoid(32))
      .setProtectedHeader({
        alg: 'RS512',
        kid: env.SIGN_KID,
      })
      .sign(signPrivateKey)
    const jwe = await new jose.CompactEncrypt(encode(jwt))
      .setProtectedHeader({
        alg: 'RSA-OAEP-256',
        enc: 'A256GCM',
        kid: env.ENC_KID,
      })
      .encrypt(encPublicKey)
    return jwe
  }

  async getUserFromToken(token: string) {
    try {
      const signPublicKey = await jose.importSPKI(env.SIGN_PUBLIC_KEY, 'RS512')
      const encPrivateKey = await jose.importPKCS8(env.ENC_PRIVATE_KEY, 'RSA-OAEP-256')
      const { plaintext: decryptedJwt } = await jose.compactDecrypt(token, encPrivateKey)
      const { payload } = await jose.jwtVerify(decode(decryptedJwt), signPublicKey)
      const userSelectResult = await db.select().from(users).where(eq(users.id, payload.sub as string))
      return { user: userSelectResult[0] }
    }
    catch (err) {
      console.log(err)
      if (err instanceof jose.errors.JWEDecryptionFailed)
        return { err: err.code }
      else if (err instanceof jose.errors.JWTExpired)
        return { err: err.code }
      else return { err: 'ERR_INVALID_TOKEN' }
    }
  }

  async produceRefreshToken(owner: string) {
    const token = nanoid(128)
    await db.insert(refreshTokens).values({ token, owner })
    return token
  }

  async getUserFromHeader(req: CreateExpressContextOptions['req']) {
    if (!req.headers.authorization)
      return undefined
    const result = await this.getUserFromToken(req.headers.authorization)
    if (result.err)
      return undefined
    return result.user
  }

  async register(newUser: {
    id?: string
    username: string
    password: string
    role: 'student' | 'admin' | 'teacher'
  }) {
    const { id, username, password, role = 'student' } = newUser
    const hash = await bcrypt.hash(password, 8)
    const user = id ? { id, username, password: hash, role } : { username, password: hash, role }
    return db.insert(users).values(user)
  }

  async login(id: string, password: string) {
    const user = (await db.select().from(users).where(eq(users.id, id)))[0]
    if (!(user && (await bcrypt.compare(password, user.password))))
      return
    const accessToken = await this.produceAccessToken(user.id)
    const refreshToken = await this.produceRefreshToken(user.id)
    return { userId: user.id, accessToken, refreshToken }
  }

  async refreshAccessToken(refreshToken: string, id: string) {
    const token = await db
      .delete(refreshTokens)
      .where(and(eq(refreshTokens.token, refreshToken), eq(refreshTokens.owner, id)))
      .returning()
    if (!token[0])
      return
    const newRefreshToken = await this.produceRefreshToken(id)
    const newAccessToken = await this.produceAccessToken(id)
    return { accessToken: newAccessToken, refreshToken: newRefreshToken }
  }
}
