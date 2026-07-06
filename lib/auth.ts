import bcryptjs from 'bcryptjs'
import { jwtVerify, SignJWT, type JWTPayload } from 'jose'

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key-change-in-production'
)

type TokenPayload = JWTPayload & {
  username?: string
  role?: string
}

export async function signToken(payload: TokenPayload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('7d')
    .sign(JWT_SECRET)
}

export async function verifyToken(token: string) {
  try {
    const verified = await jwtVerify(token, JWT_SECRET)
    return verified.payload
  } catch {
    return null
  }
}

export async function hashPassword(password: string) {
  const salt = await bcryptjs.genSalt(10)
  return bcryptjs.hash(password, salt)
}

export async function verifyPassword(password: string, hash: string) {
  return bcryptjs.compare(password, hash)
}
