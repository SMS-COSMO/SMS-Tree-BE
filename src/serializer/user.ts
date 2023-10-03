import { TUser } from '../db/db'

export const userSerializer = (user: TUser) => {
  return {
    id: user.id,
    username: user.username,
    role: user.role,
    createdAt: user.createdAt,
  }
}
