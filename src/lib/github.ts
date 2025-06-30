import { Octokit } from '@octokit/rest'

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
})

const REPO_OWNER = process.env.GITHUB_REPO_OWNER || 'your-username'
const REPO_NAME = process.env.GITHUB_REPO_NAME || 'wesavefood'
const DATA_PATH = 'data'

export interface Store {
  id: string
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
    
    await octokit.repos.createOrUpdateFileContents({
      owner: REPO_OWNER,
      repo: REPO_NAME,
      path: `${DATA_PATH}/stores.json`,
      message: `Update store ${store.id}`,
      content,
      sha: await getFileSha(`${DATA_PATH}/stores.json`),
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

async function getFileSha(path: string): Promise<string> {
  try {
    const response = await octokit.repos.getContent({
      owner: REPO_OWNER,
      repo: REPO_NAME,
      path,
    })

    if ('sha' in response.data) {
      return response.data.sha
    }
    throw new Error('File not found')
  } catch (error) {
    if ((error as any).status === 404) {
      return ''
    }
    throw error
  }
} 