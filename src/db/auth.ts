import * as jose from "jose";
import { env } from "../env";
import { nanoid } from "nanoid";
import bcrypt from "bcrypt";
import { db } from "./db";
import { refreshTokens, users } from "./schema/user";
import { and, eq } from "drizzle-orm";
const encode = TextEncoder.prototype.encode.bind(new TextEncoder());
const decode = TextDecoder.prototype.decode.bind(new TextDecoder());

let encPublicKey = await jose.importSPKI(env.ENC_PUBLIC_KEY, "RSA-OAEP-256");
let signPrivateKey = await jose.importPKCS8(env.SIGN_PRIVATE_KEY, "RS512");

// TODO: refactor Auth class
export class Auth {
    async produceAccessToken(username: string) {
        let jwt = await new jose.SignJWT({})
            .setSubject(username.toString())
            .setIssuedAt()
            .setExpirationTime("24h")
            .setIssuer("sms-tree")
            .setJti(nanoid(32))
            .setProtectedHeader({
                alg: "RS512",
                kid: env.SIGN_KID,
            })
            .sign(signPrivateKey);
        let jwe = await new jose.CompactEncrypt(encode(jwt))
            .setProtectedHeader({
                alg: "RSA-OAEP-256",
                enc: "A256GCM",
                kid: env.ENC_KID,
            })
            .encrypt(encPublicKey);
        return jwe;
    }

    async getUserFromToken(token: string) {
        try {
            let signPublicKey = await jose.importSPKI(env.SIGN_PUBLIC_KEY, "RS512");
            let encPrivateKey = await jose.importPKCS8(env.ENC_PRIVATE_KEY, "RSA-OAEP-256");
            let { plaintext: decryptedJwt } = await jose.compactDecrypt(token, encPrivateKey);
            const { protectedHeader, payload } = await jose.jwtVerify(decode(decryptedJwt), signPublicKey);
            return { user: payload.sub };
        } catch (err) {
            if (err instanceof jose.errors.JWEDecryptionFailed) return { err: err.code };
            else if (err instanceof jose.errors.JWTExpired) return { err: err.code };
            else return { err: "ERR_INVALID_TOKEN" };
        }
    }

    async produceRefreshToken(owner: string) {
        let token = nanoid(128);
        await db.insert(refreshTokens).values({ token: token, owner: owner });
        return token;
    }

    async getUserFromHeader(req: any) {
        if (!req.headers.authorization) return;
        const result = await this.getUserFromToken(req.headers.authorization.split(" ")[1]);
        if (result.err) return;
        return result.user;
    }

    async register(username: string, password: string, role: "student" | "admin" | "teacher" = "student") {
        let hash = await bcrypt.hash(password, 8);
        let user = { username: username, password: hash, role: role };
        return db.insert(users).values(user);
    }

    async login(username: string, password: string) {
        let user = (await db.select().from(users).where(eq(users.username, username)))[0];
        if (!(user && (await bcrypt.compare(password, user.password)))) return;
        let accessToken = await this.produceAccessToken(user.username);
        let refreshToken = await this.produceRefreshToken(user.username);
        return { username: user.username, accessToken: accessToken, refreshToken: refreshToken };
    }

    async refreshAccessToken(refreshToken: string, username: string) {
        let token = await db
            .delete(refreshTokens)
            .where(and(eq(refreshTokens.token, refreshToken), eq(refreshTokens.owner, username)))
            .returning();
        if (!token[0]) return;
        let newRefreshToken = await this.produceRefreshToken(username);
        let newAccessToken = await this.produceRefreshToken(username);
        return { accessToken: newAccessToken, refreshToken: newRefreshToken };
    }
}
