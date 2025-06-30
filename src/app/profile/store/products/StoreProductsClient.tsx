'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { updateProduct } from '@/lib/github'
import type { User, Store, Product } from '@/lib/github'
import ProfileLayout from '@/components/profile/ProfileLayout'
import Image from 'next/image'

interface StoreProductsClientProps {
  user: User
  store: Store
  products: Product[]
}

export default function StoreProductsClient({ user, store, products: initialProducts }: StoreProductsClientProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [products, setProducts] = useState(initialProducts)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    try {
      const formData = new FormData(e.currentTarget)
      const product: Product = {
        id: editingProduct?.id || crypto.randomUUID(),
        storeId: store.id,
        name: formData.get('name') as string,
        description: formData.get('description') as string,
        originalPrice: parseFloat(formData.get('originalPrice') as string),
        discountPrice: parseFloat(formData.get('discountPrice') as string),
        expiryDate: formData.get('expiryDate') as string,
        quantity: parseInt(formData.get('quantity') as string),
        status: editingProduct?.status || 'available',
        image: editingProduct?.image,
      }

      await updateProduct(product)
      
      if (editingProduct) {
        setProducts(products.map(p => p.id === product.id ? product : p))
        toast.success('Товар обновлен!')
      } else {
        setProducts([...products, product])
        toast.success('Товар добавлен!')
      }
      
      setEditingProduct(null)
    } catch (error) {
      console.error('Error updating product:', error)
      toast.error('Ошибка при сохранении товара')
    } finally {
      setLoading(false)
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'UZS',
      maximumFractionDigits: 0,
    }).format(price)
  }

  return (
    <ProfileLayout user={user}>
      <div className="bg-white rounded-lg shadow-soft p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Управление товарами</h2>
          <button
            type="button"
            onClick={() => setEditingProduct({
              id: '',
              storeId: store.id,
              name: '',
              description: '',
              originalPrice: 0,
              discountPrice: 0,
              expiryDate: new Date().toISOString().split('T')[0],
              quantity: 1,
              status: 'available',
              image: undefined,
            })}
            className="btn-primary"
          >
            Добавить товар
          </button>
        </div>

        {editingProduct !== null && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold">
                  {editingProduct.id ? 'Редактирование товара' : 'Новый товар'}
                </h3>
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="text-text-secondary hover:text-text-primary"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium mb-2">
                    Название
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    defaultValue={editingProduct.name}
                    className="input"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="description" className="block text-sm font-medium mb-2">
                    Описание
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    defaultValue={editingProduct.description}
                    className="input min-h-[100px]"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="originalPrice" className="block text-sm font-medium mb-2">
                      Обычная цена
                    </label>
                    <input
                      type="number"
                      id="originalPrice"
                      name="originalPrice"
                      defaultValue={editingProduct.originalPrice}
                      className="input"
                      min="0"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="discountPrice" className="block text-sm font-medium mb-2">
                      Цена со скидкой
                    </label>
                    <input
                      type="number"
                      id="discountPrice"
                      name="discountPrice"
                      defaultValue={editingProduct.discountPrice}
                      className="input"
                      min="0"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="expiryDate" className="block text-sm font-medium mb-2">
                      Срок годности
                    </label>
                    <input
                      type="date"
                      id="expiryDate"
                      name="expiryDate"
                      defaultValue={editingProduct.expiryDate.split('T')[0]}
                      className="input"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="quantity" className="block text-sm font-medium mb-2">
                      Количество
                    </label>
                    <input
                      type="number"
                      id="quantity"
                      name="quantity"
                      defaultValue={editingProduct.quantity}
                      className="input"
                      min="1"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn-primary w-full"
                  disabled={loading}
                >
                  {loading ? 'Сохранение...' : 'Сохранить товар'}
                </button>
              </form>
            </div>
          </div>
        )}

        <div className="space-y-4">
          {products.length === 0 ? (
            <div className="text-center text-text-secondary py-8">
              У вас пока нет товаров
            </div>
          ) : (
            products.map((product) => (
              <div
                key={product.id}
                className="border rounded-lg p-4 flex justify-between items-center"
              >
                <div className="flex items-center space-x-4">
                  {product.image && (
                    <div className="relative w-16 h-16 rounded-lg overflow-hidden">
                      <Image
                        src={product.image}
                        alt={product.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                  <div>
                    <h3 className="font-semibold">{product.name}</h3>
                    <div className="text-sm text-text-secondary">
                      {formatPrice(product.discountPrice)} ·{' '}
                      {product.quantity} шт.
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <div
                    className={`px-2 py-1 rounded-full text-xs ${
                      product.status === 'available'
                        ? 'bg-success/10 text-success'
                        : product.status === 'reserved'
                        ? 'bg-primary/10 text-primary'
                        : 'bg-warning/10 text-warning'
                    }`}
                  >
                    {{
                      available: 'В наличии',
                      reserved: 'Забронирован',
                      sold: 'Продан',
                    }[product.status]}
                  </div>
                  <button
                    onClick={() => setEditingProduct(product)}
                    className="text-primary hover:text-primary-dark"
                  >
                    Редактировать
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </ProfileLayout>
  )
} 