import { createHash } from 'crypto'

/**
 * Хеширует пароль с помощью SHA-256
 * @param password Пароль для хеширования
 * @returns Хешированный пароль
 */
export function hash(password: string): string {
  return createHash('sha256').update(password).digest('hex')
}

/**
 * Проверяет соответствие пароля хешу
 * @param password Пароль для проверки
 * @param hashedPassword Хешированный пароль для сравнения
 * @returns true если пароль соответствует хешу, false в противном случае
 */
export function verify(password: string, hashedPassword: string): boolean {
  const passwordHash = hash(password)
  return passwordHash === hashedPassword
} 