import { Octokit } from '@octokit/rest'
import { hash } from '@/lib/crypto'
import { Buffer } from 'buffer'
// @ts-ignore
// eslint-disable-next-line
// Для корректной работы process и Buffer в среде Node.js
// Если потребуется, установить типы: npm i --save-dev @types/node

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
})

const REPO_OWNER = process.env.GITHUB_REPO_OWNER || 'bakhasuleiman'
const REPO_NAME = process.env.GITHUB_REPO_NAME || 'wsfdb'
const DATA_PATH = 'data'

console.log('REPO_OWNER:', process.env.GITHUB_REPO_OWNER);
console.log('REPO_NAME:', process.env.GITHUB_REPO_NAME);

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

// --- Кэш в памяти ---
const userCache: Record<string, User> = {}

// --- Кэш магазинов ---
const storeCache: Record<string, Store> = {}

// --- Кэш товаров ---
const productCache: Record<string, Product> = {}

// --- Кэш резерваций ---
const reservationCache: Record<string, Reservation> = {}

// --- Логирование ---
function log(...args: any[]) {
  console.log('[GITHUB-DB]', ...args)
}

// --- Загрузка всех пользователей из GitHub при запуске ---
export async function loadAllUsersFromGitHub() {
  log('Загрузка всех пользователей из GitHub...')
  try {
    const { data: files } = await octokit.repos.getContent({
      owner: REPO_OWNER,
      repo: REPO_NAME,
      path: `${DATA_PATH}/users`,
    })
    if (Array.isArray(files)) {
      for (const file of files) {
        if (file.type === 'file' && file.name.endsWith('.json')) {
          const { data: fileData } = await octokit.repos.getContent({
            owner: REPO_OWNER,
            repo: REPO_NAME,
            path: file.path,
          })
          if ('content' in fileData) {
            const content = Buffer.from(fileData.content, 'base64').toString()
            const user: User = JSON.parse(content)
            userCache[user.id] = user
            log(`Пользователь ${user.id} загружен из ${file.name}`)
          }
        }
      }
    }
    log('Все пользователи успешно загружены.')
  } catch (error: any) {
    if (error.status === 404) {
      log('Папка пользователей ещё не создана — это нормально для пустой базы.')
    } else {
      log('Ошибка при загрузке пользователей:', error)
    }
  }
}

// --- Вызов загрузки при старте ---
loadAllUsersFromGitHub()

export async function getUsers(): Promise<User[]> {
  try {
    const { data: files } = await octokit.repos.getContent({
      owner: REPO_OWNER,
      repo: REPO_NAME,
      path: `${DATA_PATH}/users`,
    });
    if (Array.isArray(files)) {
      const users: User[] = [];
      for (const dir of files) {
        if (dir.type === 'dir') {
          try {
            const { data: profileFile } = await octokit.repos.getContent({
              owner: REPO_OWNER,
              repo: REPO_NAME,
              path: `${DATA_PATH}/users/${dir.name}/profile.json`,
            });
            if ('content' in profileFile) {
              const content = Buffer.from(profileFile.content, 'base64').toString();
              users.push(JSON.parse(content));
            }
          } catch (e) {
            // profile.json может отсутствовать — пропускаем
          }
        }
      }
      return users;
    }
    return [];
  } catch (error) {
    console.error('Error fetching users:', error);
    return [];
  }
}

// --- Асинхронное сохранение пользователя в GitHub ---
export async function saveUserToGitHub(user: User) {
  // Проверяем, существует ли папка data/users
  try {
    await octokit.repos.getContent({
      owner: REPO_OWNER,
      repo: REPO_NAME,
      path: `${DATA_PATH}/users`,
    })
  } catch (error: any) {
    if (error.status === 404) {
      // Папки нет — создаём через .gitkeep
      await octokit.repos.createOrUpdateFileContents({
        owner: REPO_OWNER,
        repo: REPO_NAME,
        path: `${DATA_PATH}/users/.gitkeep`,
        message: 'init users folder',
        content: Buffer.from('').toString('base64'),
      })
    } else {
      throw error
    }
  }
  // Далее стандартное сохранение профиля
  const path = `${DATA_PATH}/users/${user.id}/profile.json`
  const content = Buffer.from(JSON.stringify(user, null, 2)).toString('base64')
  let sha: string | undefined
  try {
    sha = await getFileSha(path)
  } catch (e) {
    log('SHA не найден для', path)
  }
  try {
    await octokit.repos.createOrUpdateFileContents({
      owner: REPO_OWNER,
      repo: REPO_NAME,
      path,
      message: `Update user ${user.id}`,
      content,
      sha,
    })
    log(`Пользователь ${user.id} сохранён в ${path}`)
  } catch (error) {
    log('Ошибка при сохранении пользователя:', error)
    throw error
  }
}

// --- Обновление пользователя: кэш + GitHub ---
export async function updateUser(user: Omit<User, 'password'> & { password?: string }): Promise<void> {
  try {
    const users = Object.values(userCache)
    const userIndex = users.findIndex(u => u.id === user.id)
    let updatedUser = user as User
    if (userIndex === -1) {
      if (user.password) {
        updatedUser.password = await hash(user.password)
      } else {
        updatedUser.password = ''
      }
      updatedUser.createdAt = new Date().toISOString()
    } else {
      const existingUser = users[userIndex]
      updatedUser = {
        ...existingUser,
        ...user,
        password: user.password ? await hash(user.password) : existingUser.password,
      }
    }
    userCache[updatedUser.id] = updatedUser
    await saveUserToGitHub(updatedUser)
  } catch (error) {
    log('Ошибка updateUser:', error)
    throw error
  }
}

export async function findUserByEmail(email: string): Promise<User | null> {
  const users = await getUsers()
  return users.find(u => u.email.toLowerCase() === email.toLowerCase()) || null
}

export async function getStores(): Promise<Store[]> {
  try {
    const { data: files } = await octokit.repos.getContent({
      owner: REPO_OWNER,
      repo: REPO_NAME,
      path: `${DATA_PATH}/stores`,
    });
    if (Array.isArray(files)) {
      const stores: Store[] = [];
      for (const dir of files) {
        if (dir.type === 'dir') {
          try {
            const { data: profileFile } = await octokit.repos.getContent({
              owner: REPO_OWNER,
              repo: REPO_NAME,
              path: `${DATA_PATH}/stores/${dir.name}/profile.json`,
            });
            if ('content' in profileFile) {
              const content = Buffer.from(profileFile.content, 'base64').toString();
              stores.push(JSON.parse(content));
            }
          } catch (e) {
            // profile.json может отсутствовать — пропускаем
          }
        }
      }
      return stores;
    }
    return [];
  } catch (error) {
    console.error('Error fetching stores:', error);
    return [];
  }
}

export async function getProducts(): Promise<Product[]> {
  try {
    const { data: files } = await octokit.repos.getContent({
      owner: REPO_OWNER,
      repo: REPO_NAME,
      path: `${DATA_PATH}/products`,
    });
    if (Array.isArray(files)) {
      const products: Product[] = [];
      for (const dir of files) {
        if (dir.type === 'dir') {
          try {
            const { data: productFile } = await octokit.repos.getContent({
              owner: REPO_OWNER,
              repo: REPO_NAME,
              path: `${DATA_PATH}/products/${dir.name}/product.json`,
            });
            if ('content' in productFile) {
              const content = Buffer.from(productFile.content, 'base64').toString();
              products.push(JSON.parse(content));
            }
          } catch (e) {
            // product.json может отсутствовать — пропускаем
          }
        }
      }
      return products;
    }
    return [];
  } catch (error) {
    console.error('Error fetching products:', error);
    return [];
  }
}

// --- Загрузка всех магазинов из GitHub при запуске ---
export async function loadAllStoresFromGitHub() {
  log('Загрузка всех магазинов из GitHub...')
  try {
    const { data: files } = await octokit.repos.getContent({
      owner: REPO_OWNER,
      repo: REPO_NAME,
      path: `${DATA_PATH}/stores`,
    })
    if (Array.isArray(files)) {
      for (const file of files) {
        if (file.type === 'file' && file.name.endsWith('.json')) {
          const { data: fileData } = await octokit.repos.getContent({
            owner: REPO_OWNER,
            repo: REPO_NAME,
            path: file.path,
          })
          if ('content' in fileData) {
            const content = Buffer.from(fileData.content, 'base64').toString()
            const store: Store = JSON.parse(content)
            storeCache[store.id] = store
            log(`Магазин ${store.id} загружен из ${file.name}`)
          }
        }
      }
    }
    log('Все магазины успешно загружены.')
  } catch (error: any) {
    if (error.status === 404) {
      log('Папка магазинов ещё не создана — это нормально для пустой базы.')
    } else {
      log('Ошибка при загрузке магазинов:', error)
    }
  }
}

loadAllStoresFromGitHub()

// --- Асинхронное сохранение магазина в GitHub ---
export async function saveStoreToGitHub(store: Store) {
  const path = `${DATA_PATH}/stores/${store.id}/profile.json`
  const content = Buffer.from(JSON.stringify(store, null, 2)).toString('base64')
  let sha: string | undefined
  try {
    sha = await getFileSha(path)
  } catch (e) {
    log('SHA не найден для', path)
  }
  try {
    await octokit.repos.createOrUpdateFileContents({
      owner: REPO_OWNER,
      repo: REPO_NAME,
      path,
      message: `Update store ${store.id}`,
      content,
      sha,
    })
    log(`Магазин ${store.id} сохранён в ${path}`)
  } catch (error) {
    log('Ошибка при сохранении магазина:', error)
    throw error
  }
}

// --- Обновление магазина: кэш + GitHub ---
export async function updateStore(store: Store): Promise<void> {
  try {
    storeCache[store.id] = store
    await saveStoreToGitHub(store)
  } catch (error) {
    log('Ошибка updateStore:', error)
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
    const { data: files } = await octokit.repos.getContent({
      owner: REPO_OWNER,
      repo: REPO_NAME,
      path: `${DATA_PATH}/reservations`,
    });
    if (Array.isArray(files)) {
      const reservations: Reservation[] = [];
      for (const dir of files) {
        if (dir.type === 'dir') {
          try {
            const { data: reservationFile } = await octokit.repos.getContent({
              owner: REPO_OWNER,
              repo: REPO_NAME,
              path: `${DATA_PATH}/reservations/${dir.name}/reservation.json`,
            });
            if ('content' in reservationFile) {
              const content = Buffer.from(reservationFile.content, 'base64').toString();
              reservations.push(JSON.parse(content));
            }
          } catch (e) {
            // reservation.json может отсутствовать — пропускаем
          }
        }
      }
      return reservations;
    }
    return [];
  } catch (error) {
    console.error('Error fetching reservations:', error);
    return [];
  }
}

export async function getReservationsByUserId(userId: string): Promise<Reservation[]> {
  const reservations = await getReservations()
  return reservations.filter(r => r.userId === userId)
}

// --- Загрузка всех товаров из GitHub при запуске ---
export async function loadAllProductsFromGitHub() {
  log('Загрузка всех товаров из GitHub...')
  try {
    const { data: files } = await octokit.repos.getContent({
      owner: REPO_OWNER,
      repo: REPO_NAME,
      path: `${DATA_PATH}/products`,
    })
    if (Array.isArray(files)) {
      for (const file of files) {
        if (file.type === 'file' && file.name.endsWith('.json')) {
          const { data: fileData } = await octokit.repos.getContent({
            owner: REPO_OWNER,
            repo: REPO_NAME,
            path: file.path,
          })
          if ('content' in fileData) {
            const content = Buffer.from(fileData.content, 'base64').toString()
            const product: Product = JSON.parse(content)
            productCache[product.id] = product
            log(`Товар ${product.id} загружен из ${file.name}`)
          }
        }
      }
    }
    log('Все товары успешно загружены.')
  } catch (error: any) {
    if (error.status === 404) {
      log('Папка товаров ещё не создана — это нормально для пустой базы.')
    } else {
      log('Ошибка при загрузке товаров:', error)
    }
  }
}

loadAllProductsFromGitHub()

// --- Асинхронное сохранение товара в GitHub ---
export async function saveProductToGitHub(product: Product) {
  const path = `${DATA_PATH}/products/${product.id}/product.json`
  const content = Buffer.from(JSON.stringify(product, null, 2)).toString('base64')
  let sha: string | undefined
  try {
    sha = await getFileSha(path)
  } catch (e) {
    log('SHA не найден для', path)
  }
  try {
    await octokit.repos.createOrUpdateFileContents({
      owner: REPO_OWNER,
      repo: REPO_NAME,
      path,
      message: `Update product ${product.id}`,
      content,
      sha,
    })
    log(`Товар ${product.id} сохранён в ${path}`)
  } catch (error) {
    log('Ошибка при сохранении товара:', error)
    throw error
  }
}

// --- Обновление товара: кэш + GitHub ---
export async function updateProduct(product: Product): Promise<void> {
  try {
    productCache[product.id] = product
    await saveProductToGitHub(product)
  } catch (error) {
    log('Ошибка updateProduct:', error)
    throw error
  }
}

// --- Загрузка всех резерваций из GitHub при запуске ---
export async function loadAllReservationsFromGitHub() {
  log('Загрузка всех резерваций из GitHub...')
  try {
    const { data: files } = await octokit.repos.getContent({
      owner: REPO_OWNER,
      repo: REPO_NAME,
      path: `${DATA_PATH}/reservations`,
    })
    if (Array.isArray(files)) {
      for (const file of files) {
        if (file.type === 'file' && file.name.endsWith('.json')) {
          const { data: fileData } = await octokit.repos.getContent({
            owner: REPO_OWNER,
            repo: REPO_NAME,
            path: file.path,
          })
          if ('content' in fileData) {
            const content = Buffer.from(fileData.content, 'base64').toString()
            const reservation: Reservation = JSON.parse(content)
            reservationCache[reservation.id] = reservation
            log(`Резервация ${reservation.id} загружена из ${file.name}`)
          }
        }
      }
    }
    log('Все резервации успешно загружены.')
  } catch (error: any) {
    if (error.status === 404) {
      log('Папка резерваций ещё не создана — это нормально для пустой базы.')
    } else {
      log('Ошибка при загрузке резерваций:', error)
    }
  }
}

loadAllReservationsFromGitHub()

// --- Асинхронное сохранение резервации в GitHub ---
export async function saveReservationToGitHub(reservation: Reservation) {
  const path = `${DATA_PATH}/reservations/${reservation.id}/reservation.json`
  const content = Buffer.from(JSON.stringify(reservation, null, 2)).toString('base64')
  let sha: string | undefined
  try {
    sha = await getFileSha(path)
  } catch (e) {
    log('SHA не найден для', path)
  }
  try {
    await octokit.repos.createOrUpdateFileContents({
      owner: REPO_OWNER,
      repo: REPO_NAME,
      path,
      message: `Update reservation ${reservation.id}`,
      content,
      sha,
    })
    log(`Резервация ${reservation.id} сохранена в ${path}`)
  } catch (error) {
    log('Ошибка при сохранении резервации:', error)
    throw error
  }
}

// --- Автосохранение всех резерваций из кэша в GitHub ---
async function autoSaveAllReservations() {
  log('Автосохранение всех резерваций...')
  const reservations = Object.values(reservationCache)
  for (const reservation of reservations) {
    try {
      await saveReservationToGitHub(reservation)
    } catch (e) {
      log('Ошибка автосохранения резервации', reservation.id, e)
    }
  }
  log('Автосохранение резерваций завершено.')
}

setInterval(autoSaveAllReservations, 5 * 60 * 1000)

// --- Сохранение резерваций при завершении работы сервера ---
async function gracefulShutdownReservations() {
  log('Завершение работы сервера. Сохраняю все резервации...')
  await autoSaveAllReservations()
  log('Все резервации сохранены.')
}

process.on('SIGINT', gracefulShutdownReservations)
process.on('SIGTERM', gracefulShutdownReservations)

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

// --- Автосохранение всех пользователей из кэша в GitHub ---
async function autoSaveAllUsers() {
  log('Автосохранение всех пользователей...')
  const users = Object.values(userCache)
  for (const user of users) {
    try {
      await saveUserToGitHub(user)
    } catch (e) {
      log('Ошибка автосохранения пользователя', user.id, e)
    }
  }
  log('Автосохранение завершено.')
}

setInterval(autoSaveAllUsers, 5 * 60 * 1000) // каждые 5 минут

// --- Автосохранение всех магазинов из кэша в GitHub ---
async function autoSaveAllStores() {
  log('Автосохранение всех магазинов...')
  const stores = Object.values(storeCache)
  for (const store of stores) {
    try {
      await saveStoreToGitHub(store)
    } catch (e) {
      log('Ошибка автосохранения магазина', store.id, e)
    }
  }
  log('Автосохранение магазинов завершено.')
}

setInterval(autoSaveAllStores, 5 * 60 * 1000)

// --- Сохранение при завершении работы сервера ---
async function gracefulShutdown() {
  log('Завершение работы сервера. Сохраняю все данные...')
  await autoSaveAllUsers()
  await autoSaveAllStores()
  log('Все данные сохранены. Завершение.')
  process.exit(0)
}

process.on('SIGINT', gracefulShutdown)
process.on('SIGTERM', gracefulShutdown)

// --- Обновление резервации: кэш + GitHub ---
export async function updateReservation(reservation: Reservation): Promise<void> {
  try {
    reservationCache[reservation.id] = reservation
    await saveReservationToGitHub(reservation)
  } catch (error) {
    log('Ошибка updateReservation:', error)
    throw error
  }
} 