'use client'

import { useState, useEffect } from 'react'
import { getAll, update } from '@/lib/github-db'
import type { User, Store, Product } from '@/lib/github'
import ProfileLayout from '@/components/profile/ProfileLayout'
import toast from 'react-hot-toast'

interface ProductsProps {
  user: User
  store: Store
}

const emptyProduct = (storeId: string): Product => ({
  id: '',
  storeId,
  name: '',
  description: '',
  originalPrice: 0,
  discountPrice: 0,
  expiryDate: new Date().toISOString().split('T')[0],
  quantity: 1,
  status: 'available',
  image: undefined,
})

export default function Products({ user, store }: ProductsProps) {
  const [loading, setLoading] = useState(true)
  const [products, setProducts] = useState<Product[]>([])
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const allProducts = await getAll('products')
        const prods = allProducts.filter((p: any) => p.storeId === store.id)
        setProducts(prods)
      } catch (e) {
        toast.error('Ошибка загрузки товаров')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [store.id])

  const handleEdit = (product: Product) => setEditingProduct(product)
  const handleAdd = () => setEditingProduct(emptyProduct(store.id))
  const handleCloseModal = () => setEditingProduct(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!editingProduct) return
    setLoading(true)
    try {
      const formData = new FormData(e.currentTarget)
      const product: Product = {
        ...editingProduct,
        name: formData.get('name') as string,
        description: formData.get('description') as string,
        originalPrice: parseFloat(formData.get('originalPrice') as string),
        discountPrice: parseFloat(formData.get('discountPrice') as string),
        expiryDate: formData.get('expiryDate') as string,
        quantity: parseInt(formData.get('quantity') as string),
      }
      await update('products', product.id, product)
      setProducts(prev => {
        const exists = prev.find(p => p.id === product.id)
        if (exists) {
          return prev.map(p => p.id === product.id ? product : p)
        } else {
          return [...prev, { ...product, id: product.id || crypto.randomUUID() }]
        }
      })
      toast.success(product.id ? 'Товар обновлен!' : 'Товар добавлен!')
      setEditingProduct(null)
    } catch (e) {
      toast.error('Ошибка при сохранении товара')
    } finally {
      setLoading(false)
    }
  }

  const formatPrice = (price: number) => new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'UZS', maximumFractionDigits: 0 }).format(price)

  return (
    <ProfileLayout user={user}>
      <div className="bg-white rounded-lg shadow-soft p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Управление товарами</h2>
          <button type="button" onClick={handleAdd} className="btn-primary">Добавить товар</button>
        </div>
        {loading ? (
          <div className="animate-pulse space-y-4">{[1,2,3].map(i => <div key={i} className="h-24 bg-secondary rounded" />)}</div>
        ) : products.length === 0 ? (
          <div className="text-center text-text-secondary py-8">У вас пока нет товаров</div>
        ) : (
          <div className="space-y-4">
            {products.map(product => (
              <div key={product.id} className="border rounded-lg p-4 flex justify-between items-center">
                <div>
                  <div className="font-semibold">{product.name}</div>
                  <div className="text-sm text-text-secondary">{product.description}</div>
                  <div className="text-xs text-text-secondary">Срок годности: {product.expiryDate}</div>
                </div>
                <div className="text-right">
                  <div className="font-semibold">{formatPrice(product.discountPrice)}</div>
                  <div className="text-sm text-warning line-through">{formatPrice(product.originalPrice)}</div>
                  <button className="btn-secondary mt-2" onClick={() => handleEdit(product)}>Редактировать</button>
                </div>
              </div>
            ))}
          </div>
        )}
        {editingProduct && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold">{editingProduct.id ? 'Редактирование товара' : 'Новый товар'}</h3>
                <button type="button" onClick={handleCloseModal} className="text-text-secondary hover:text-text-primary">✕</button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium mb-2">Название</label>
                  <input type="text" id="name" name="name" defaultValue={editingProduct.name} className="input" required />
                </div>
                <div>
                  <label htmlFor="description" className="block text-sm font-medium mb-2">Описание</label>
                  <textarea id="description" name="description" defaultValue={editingProduct.description} className="input min-h-[100px]" required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="originalPrice" className="block text-sm font-medium mb-2">Обычная цена</label>
                    <input type="number" id="originalPrice" name="originalPrice" defaultValue={editingProduct.originalPrice} className="input" min="0" required />
                  </div>
                  <div>
                    <label htmlFor="discountPrice" className="block text-sm font-medium mb-2">Цена со скидкой</label>
                    <input type="number" id="discountPrice" name="discountPrice" defaultValue={editingProduct.discountPrice} className="input" min="0" required />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="expiryDate" className="block text-sm font-medium mb-2">Срок годности</label>
                    <input type="date" id="expiryDate" name="expiryDate" defaultValue={editingProduct.expiryDate.split('T')[0]} className="input" required />
                  </div>
                  <div>
                    <label htmlFor="quantity" className="block text-sm font-medium mb-2">Количество</label>
                    <input type="number" id="quantity" name="quantity" defaultValue={editingProduct.quantity} className="input" min="1" required />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <button type="button" className="btn-secondary" onClick={handleCloseModal} disabled={loading}>Отмена</button>
                  <button type="submit" className="btn-primary" disabled={loading}>{loading ? 'Сохранение...' : 'Сохранить'}</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </ProfileLayout>
  )
} 