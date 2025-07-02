// Для работы требуется: npm install @octokit/rest
// Для типов Node.js: npm install --save-dev @types/node
import { Octokit } from '@octokit/rest'
import { Buffer } from 'buffer'

const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN })
const REPO_OWNER = process.env.GITHUB_REPO_OWNER || 'bakhasuleiman'
const REPO_NAME = process.env.GITHUB_REPO_NAME || 'wsfdb'
const DATA_PATH = 'data'
const BRANCH = 'main'

// Типы сущностей
export interface User {
  id: string
  email: string
  password: string
  name: string
  phone: string
  role: 'customer' | 'store'
  createdAt: string
  photo_url?: string
}
export interface Store {
  id: string
  userId: string
  name: string
  address: string
  location: { lat: number; lng: number }
  description: string
  phone: string
}
export interface Product {
  id: string
  storeId: string
  name: string
  description: string
  originalPrice: number
  discountPrice: number
  expiryDate: string
  quantity: number
  image?: string
  status: 'available' | 'reserved' | 'sold'
}
export interface Reservation {
  id: string
  userId: string
  productId: string
  storeId: string
  createdAt: string
  status: 'active' | 'completed' | 'cancelled'
}

type TableKey = 'users' | 'stores' | 'products' | 'reservations'

type TableTypeMap = {
  users: User
  stores: Store
  products: Product
  reservations: Reservation
}

type TableType<K extends TableKey> = TableTypeMap[K]

const TABLES: { [K in TableKey]: { file: string; default: TableType<K>[] } } = {
  users: { file: 'users.json', default: [] as User[] },
  stores: { file: 'stores.json', default: [] as Store[] },
  products: { file: 'products.json', default: [] as Product[] },
  reservations: { file: 'reservations.json', default: [] as Reservation[] },
}

const dbCache: Partial<Record<TableKey, any[]>> = {}
const shaCache: Partial<Record<TableKey, string>> = {}
let isSaving = false

async function readTable<K extends TableKey>(table: K): Promise<TableType<K>[]> {
  if (dbCache[table]) return dbCache[table] as TableType<K>[]
  const path = `${DATA_PATH}/${TABLES[table].file}`
  try {
    const { data } = await octokit.repos.getContent({
      owner: REPO_OWNER,
      repo: REPO_NAME,
      path,
      ref: BRANCH,
    })
    if ('content' in data) {
      const content = Buffer.from(data.content, 'base64').toString()
      const arr = JSON.parse(content) as TableType<K>[]
      dbCache[table] = arr as any[]
      if ('sha' in data) shaCache[table] = data.sha
      return arr
    }
    return TABLES[table].default as TableType<K>[]
  } catch (e: any) {
    if (e.status === 404) {
      await writeTable(table, TABLES[table].default as TableType<K>[])
      dbCache[table] = TABLES[table].default as any[]
      return TABLES[table].default as TableType<K>[]
    }
    throw e
  }
}

async function writeTable<K extends TableKey>(table: K, arr: TableType<K>[]) {
  const path = `${DATA_PATH}/${TABLES[table].file}`
  const content = Buffer.from(JSON.stringify(arr, null, 2)).toString('base64')
  let sha = shaCache[table]
  try {
    const res = await octokit.repos.createOrUpdateFileContents({
      owner: REPO_OWNER,
      repo: REPO_NAME,
      path,
      message: `Update ${TABLES[table].file}` ,
      content,
      sha,
      branch: BRANCH,
    })
    if ('content' in res.data && res.data.content?.sha) shaCache[table] = res.data.content.sha
    dbCache[table] = arr as any[]
  } catch (e) {
    throw e
  }
}

export async function getAll<K extends TableKey>(table: K): Promise<TableType<K>[]> {
  return await readTable(table)
}
export async function getById<K extends TableKey>(table: K, id: string): Promise<TableType<K> | undefined> {
  const arr = await readTable(table)
  return arr.find((item: any) => item.id === id)
}
export async function create<K extends TableKey>(table: K, obj: TableType<K>): Promise<void> {
  const arr = await readTable(table)
  arr.push(obj)
  await writeTable(table, arr)
}
export async function update<K extends TableKey>(table: K, id: string, patch: Partial<TableType<K>>): Promise<void> {
  const arr = await readTable(table)
  const idx = arr.findIndex((item: any) => item.id === id)
  if (idx === -1) throw new Error('Not found')
  arr[idx] = { ...arr[idx], ...patch }
  await writeTable(table, arr)
}
export async function remove<K extends TableKey>(table: K, id: string): Promise<void> {
  const arr = await readTable(table)
  const idx = arr.findIndex((item: any) => item.id === id)
  if (idx === -1) throw new Error('Not found')
  arr.splice(idx, 1)
  await writeTable(table, arr)
}

// Автосохранение (каждые 5 минут)
setInterval(async () => {
  if (isSaving) return
  isSaving = true
  try {
    for (const table of Object.keys(TABLES) as TableKey[]) {
      if (dbCache[table]) await writeTable(table, dbCache[table] as TableType<typeof table>[])
    }
  } catch (e) { /* log error */ }
  isSaving = false
}, 5 * 60 * 1000)

// Инициализация файлов-таблиц при запуске
export async function initializeDbFiles() {
  for (const table of Object.keys(TABLES) as TableKey[]) {
    try {
      await readTable(table)
    } catch {}
  }
} 