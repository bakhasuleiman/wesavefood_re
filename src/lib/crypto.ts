import { createHash } from 'crypto'

export async function hash(password: string): Promise<string> {
  return createHash('sha256')
    .update(password + process.env.PASSWORD_SALT)
    .digest('hex')
} 