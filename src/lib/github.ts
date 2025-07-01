import { Octokit } from '@octokit/rest'
import { hash } from '@/lib/crypto'

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
})

const REPO_OWNER = process.env.GITHUB_REPO_OWNER || 'your-username'
const REPO_NAME = process.env.GITHUB_REPO_NAME || 'wesavefood'
const DATA_PATH = 'data'

export interface User {
  id: string
  email: string
  password: string // хешированный
  name: string
  phone: string
  role: 'customer' | 'store'
  createdAt: string
  photo_url?: string // аватарка Telegram
}

export interface Store {
  id: string
  userId: string // связь с пользователем
  name: string
  address: string
  location: {
    lat: number
    lng: number
  }
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

export async function getUsers(): Promise<User[]> {
  try {
    const response = await octokit.repos.getContent({
      owner: REPO_OWNER,
      repo: REPO_NAME,
      path: `${DATA_PATH}/users.json`,
    })

    if ('content' in response.data) {
      const content = Buffer.from(response.data.content, 'base64').toString()
      return JSON.parse(content)
    }
    return []
  } catch (error) {
    console.error('Error fetching users:', error)
    return []
  }
}

export async function updateUser(user: Omit<User, 'password'> & { password?: string }): Promise<void> {
  try {
    const users = await getUsers()
    const userIndex = users.findIndex(u => u.id === user.id)
    
    let updatedUser = user as User

    if (userIndex === -1) {
      // Новый пользователь
      if (user.password) {
        updatedUser.password = await hash(user.password)
      } else {
        // Для Telegram/соц.логина — пароль не требуется
        updatedUser.password = ''
      }
      updatedUser.createdAt = new Date().toISOString()
      users.push(updatedUser)
    } else {
      // Обновление существующего пользователя
      const existingUser = users[userIndex]
      updatedUser = {
        ...existingUser,
        ...user,
        role: existingUser.role, // всегда сохраняем исходную роль
        password: user.password ? await hash(user.password) : existingUser.password,
      }
      users[userIndex] = updatedUser
    }

    const content = Buffer.from(JSON.stringify(users, null, 2)).toString('base64')
    
    await octokit.repos.createOrUpdateFileContents({
      owner: REPO_OWNER,
      repo: REPO_NAME,
      path: `${DATA_PATH}/users.json`,
      message: `Update user ${user.id}`,
      content,
      sha: await getFileSha(`${DATA_PATH}/users.json`),
    })
  } catch (error) {
    console.error('Error updating user:', error)
    throw error
  }
}

export async function findUserByEmail(email: string): Promise<User | null> {
  const users = await getUsers()
  return users.find(u => u.email.toLowerCase() === email.toLowerCase()) || null
}

export async function getStores(): Promise<Store[]> {
  try {
    const response = await octokit.repos.getContent({
      owner: REPO_OWNER,
      repo: REPO_NAME,
      path: `${DATA_PATH}/stores.json`,
    })

    if ('content' in response.data) {
      const content = Buffer.from(response.data.content, 'base64').toString()
      return JSON.parse(content)
    }
    return []
  } catch (error) {
    console.error('Error fetching stores:', error)
    return []
  }
}

export async function getProducts(): Promise<Product[]> {
  try {
    const response = await octokit.repos.getContent({
      owner: REPO_OWNER,
      repo: REPO_NAME,
      path: `${DATA_PATH}/products.json`,
    })

    if ('content' in response.data) {
      const content = Buffer.from(response.data.content, 'base64').toString()
      return JSON.parse(content)
    }
    return []
  } catch (error) {
    console.error('Error fetching products:', error)
    return []
  }
}

export async function updateStore(store: Store): Promise<void> {
  try {
    const stores = await getStores()
    const storeIndex = stores.findIndex(s => s.id === store.id)
    
    if (storeIndex === -1) {
      stores.push(store)
    } else {
      stores[storeIndex] = store
    }

    const content = Buffer.from(JSON.stringify(stores, null, 2)).toString('base64')
    const sha = await getFileSha(`${DATA_PATH}/stores.json`)
    
    await octokit.repos.createOrUpdateFileContents({
      owner: REPO_OWNER,
      repo: REPO_NAME,
      path: `${DATA_PATH}/stores.json`,
      message: `Update store ${store.id}`,
      content,
      sha,
    })
  } catch (error) {
    console.error('Error updating store:', error)
    throw error
  }
}

export async function updateProduct(product: Product): Promise<void> {
  try {
    const products = await getProducts()
    const productIndex = products.findIndex(p => p.id === product.id)
    
    if (productIndex === -1) {
      products.push(product)
    } else {
      products[productIndex] = product
    }

    const content = Buffer.from(JSON.stringify(products, null, 2)).toString('base64')
    
    await octokit.repos.createOrUpdateFileContents({
      owner: REPO_OWNER,
      repo: REPO_NAME,
      path: `${DATA_PATH}/products.json`,
      message: `Update product ${product.id}`,
      content,
      sha: await getFileSha(`${DATA_PATH}/products.json`),
    })
  } catch (error) {
    console.error('Error updating product:', error)
    throw error
  }
}

export async function getFileSha(path: string): Promise<string | undefined> {
  try {
    const response = await octokit.repos.getContent({
      owner: REPO_OWNER,
      repo: REPO_NAME,
      path,
    })

    if ('sha' in response.data) {
      return response.data.sha
    }
    return undefined
  } catch (error) {
    if ((error as any).status === 404) {
      return undefined
    }
    throw error
  }
}

export async function getUserById(userId: string): Promise<User | null> {
  const users = await getUsers()
  return users.find(u => u.id === userId) || null
}

export async function getStoreByUserId(userId: string): Promise<Store | null> {
  const stores = await getStores()
  return stores.find(s => s.userId === userId) || null
}

export async function getProductsByStoreId(storeId: string): Promise<Product[]> {
  const products = await getProducts()
  return products.filter(p => p.storeId === storeId)
}

export async function getReservations(): Promise<Reservation[]> {
  try {
    const response = await octokit.repos.getContent({
      owner: REPO_OWNER,
      repo: REPO_NAME,
      path: `${DATA_PATH}/reservations.json`,
    })

    if ('content' in response.data) {
      const content = Buffer.from(response.data.content, 'base64').toString()
      return JSON.parse(content)
    }
    return []
  } catch (error) {
    console.error('Error fetching reservations:', error)
    return []
  }
}

export async function getReservationsByUserId(userId: string): Promise<Reservation[]> {
  const reservations = await getReservations()
  return reservations.filter(r => r.userId === userId)
}

export async function updateReservation(reservation: Reservation): Promise<void> {
  try {
    const reservations = await getReservations()
    const reservationIndex = reservations.findIndex(r => r.id === reservation.id)
    
    if (reservationIndex === -1) {
      reservations.push(reservation)
    } else {
      reservations[reservationIndex] = reservation
    }

    const content = Buffer.from(JSON.stringify(reservations, null, 2)).toString('base64')
    
    await octokit.repos.createOrUpdateFileContents({
      owner: REPO_OWNER,
      repo: REPO_NAME,
      path: `${DATA_PATH}/reservations.json`,
      message: `Update reservation ${reservation.id}`,
      content,
      sha: await getFileSha(`${DATA_PATH}/reservations.json`),
    })
  } catch (error) {
    console.error('Error updating reservation:', error)
    throw error
  }
}

// Функция для инициализации JSON файлов, если они не существуют
export async function initializeDataFiles(): Promise<void> {
  try {
    const files = ['users.json', 'stores.json', 'products.json', 'reservations.json']
    
    for (const file of files) {
      const sha = await getFileSha(`${DATA_PATH}/${file}`)
      
      if (!sha) {
        // Файл не существует, создаем его с пустым массивом
        await octokit.repos.createOrUpdateFileContents({
          owner: REPO_OWNER,
          repo: REPO_NAME,
          path: `${DATA_PATH}/${file}`,
          message: `Initialize ${file}`,
          content: Buffer.from('[]').toString('base64'),
        })
      }
    }
  } catch (error) {
    console.error('Error initializing data files:', error)
    throw error
  }
} 