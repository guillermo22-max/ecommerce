import { ImageOff, Minus, Plus, ShoppingCart } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getProduct } from '../api/products'
import { Button } from '../components/ui/Button'
import { Spinner } from '../components/ui/Spinner'
import { useAuth } from '../hooks/useAuth'
import { useCart } from '../hooks/useCart'
import { formatCurrency } from '../lib/format'

export function ProductDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { addItem } = useCart()
  const [product, setProduct] = useState(null)
  const [quantity, setQuantity] = useState(1)
  const [loading, setLoading] = useState(true)
  const [adding, setAdding] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    setLoading(true)
    getProduct(id)
      .then(setProduct)
      .catch(() => setError('Producto no encontrado.'))
      .finally(() => setLoading(false))
  }, [id])

  async function handleAddToCart() {
    if (!user) {
      navigate('/login')
      return
    }
    setAdding(true)
    try {
      await addItem(Number(id), quantity)
    } finally {
      setAdding(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner />
      </div>
    )
  }

  if (error || !product) {
    return <p className="py-12 text-center text-red-600">{error}</p>
  }

  const image = product.images?.[0]

  return (
    <div className="grid gap-10 md:grid-cols-2">
      <div className="aspect-square overflow-hidden rounded-2xl bg-slate-100">
        {image ? (
          <img
            src={image.url}
            alt={image.alt_text ?? product.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-slate-300">
            <ImageOff className="h-10 w-10" />
            <span className="text-sm text-slate-400">Sin imagen</span>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-4">
        <h1 className="text-3xl font-bold text-slate-900">{product.name}</h1>
        <p className="text-2xl font-bold text-indigo-600">{formatCurrency(product.price)}</p>
        {product.description && <p className="text-slate-600">{product.description}</p>}

        <p className="text-sm">
          {product.stock > 0 ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 font-medium text-emerald-700">
              {product.stock} disponibles
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-2.5 py-1 font-medium text-red-600">
              Agotado
            </span>
          )}
        </p>

        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-slate-700">Cantidad</span>
          <div className="flex items-center rounded-md border border-slate-300">
            <button
              type="button"
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              disabled={quantity <= 1}
              className="flex h-9 w-9 items-center justify-center text-slate-600 hover:bg-slate-100 disabled:text-slate-300"
              aria-label="Disminuir cantidad"
            >
              <Minus className="h-4 w-4" />
            </button>
            <span className="w-10 text-center text-sm font-medium text-slate-900">{quantity}</span>
            <button
              type="button"
              onClick={() => setQuantity((q) => Math.min(product.stock || 1, q + 1))}
              disabled={quantity >= (product.stock || 1)}
              className="flex h-9 w-9 items-center justify-center text-slate-600 hover:bg-slate-100 disabled:text-slate-300"
              aria-label="Aumentar cantidad"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
        </div>

        <Button
          onClick={handleAddToCart}
          disabled={product.stock === 0 || adding}
          className="w-fit"
        >
          <ShoppingCart className="h-4 w-4" />
          {adding ? 'Agregando...' : 'Agregar al carrito'}
        </Button>
      </div>
    </div>
  )
}
