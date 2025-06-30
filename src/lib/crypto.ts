/**
 * Хеширует пароль с использованием SHA-256
 * В реальном приложении следует использовать более безопасные методы, например bcrypt
 */
export async function hash(password: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(password)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
  return hashHex
}

/**
 * Проверяет соответствие пароля его хешу
 */
export async function verify(password: string, hash: string): Promise<boolean> {
  const hashedPassword = await hash(password)
  return hashedPassword === hash
} 