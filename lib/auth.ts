import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

function getJWTSecret(): string {
  const secret = process.env.JWT_SECRET
  if (!secret) {
    throw new Error('JWT_SECRET environment variable is not set')
  }
  return secret
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10)
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

export function generateToken(userId: number): string {
  return jwt.sign({ userId }, getJWTSecret(), { expiresIn: '7d' })
}

export function verifyToken(token: string): { userId: number } | null {
  try {
    return jwt.verify(token, getJWTSecret()) as { userId: number }
  } catch {
    return null
  }
}
