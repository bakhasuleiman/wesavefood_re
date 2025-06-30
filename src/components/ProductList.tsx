import Image from 'next/image'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'
import type { Product } from '@/lib/github'

interface ProductListProps {
  products: Product[]
  onReserve?: (product: Product) => void
}

export default function ProductList({ products, onReserve }: ProductListProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'UZS',
      maximumFractionDigits: 0,
    }).format(price)
  }

  const calculateDiscount = (original: number, discounted: number) => {
    return Math.round(((original - discounted) / original) * 100)
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {products.map((product) => (
        <div key={product.id} className="card">
          {product.image && (
            <div className="relative h-48 mb-4 rounded-lg overflow-hidden">
              <Image
                src={product.image}
                alt={product.name}
                fill
                className="object-cover"
              />
            </div>
          )}
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-lg font-semibold">{product.name}</h3>
            <div className="bg-accent text-white px-2 py-1 rounded-full text-sm">
              -{calculateDiscount(product.originalPrice, product.discountPrice)}%
            </div>
          </div>
          <p className="text-text-secondary text-sm mb-4">{product.description}</p>
          <div className="flex justify-between items-center mb-4">
            <div>
              <div className="text-warning line-through text-sm">
                {formatPrice(product.originalPrice)}
              </div>
              <div className="text-lg font-semibold">
                {formatPrice(product.discountPrice)}
              </div>
            </div>
            <div className="text-sm text-text-secondary">
              До {format(new Date(product.expiryDate), 'dd MMMM', { locale: ru })}
            </div>
          </div>
          {product.status === 'available' && (
            <button
              onClick={() => onReserve?.(product)}
              className="btn-primary w-full"
            >
              Забронировать
            </button>
          )}
          {product.status === 'reserved' && (
            <div className="text-center text-text-secondary py-2 bg-secondary rounded-lg">
              Забронировано
            </div>
          )}
          {product.status === 'sold' && (
            <div className="text-center text-warning py-2 bg-secondary rounded-lg">
              Продано
            </div>
          )}
        </div>
      ))}
    </div>
  )
} 