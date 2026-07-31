import { Minus, Plus, ShoppingCart, Trash2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '../components/ui/Button'
import { Spinner } from '../components/ui/Spinner'
import { useCart } from '../hooks/useCart'
import { formatCurrency } from '../lib/format'

export function CartPage() {
  const { cart, loading, total, updateItem, removeItem } = useCart()

  if (loading && !cart) {
    return (
      <div className="flex justify-center py-16">
        <Spinner />
      </div>
    )
  }

  const items = cart?.items ?? []

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 py-20 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-indigo-50 text-indigo-500">
          <ShoppingCart className="h-7 w-7" />
        </div>
        <div>
          <p className="font-medium text-slate-900">Tu carrito está vacío</p>
          <p className="text-sm text-slate-500">Agrega productos para empezar tu compra.</p>
        </div>
        <Link to="/">
          <Button>Ver productos</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold text-slate-900">Tu carrito</h1>

      <div className="flex flex-col divide-y divide-slate-200 rounded-xl border border-slate-200 bg-white">
        {items.map((item) => (
          <div key={item.id} className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center">
            <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg bg-slate-100">
              {item.product.images?.[0] ? (
                <img
                  src={item.product.images[0].url}
                  alt={item.product.name}
                  className="h-full w-full object-cover"
                />
              ) : null}
            </div>

            <div className="flex-1">
              <Link
                to={`/products/${item.product.id}`}
                className="font-medium text-slate-900 hover:text-indigo-600"
              >
                {item.product.name}
              </Link>
              <p className="text-sm text-slate-500">{formatCurrency(item.product.price)}</p>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center rounded-md border border-slate-300">
                <button
                  type="button"
                  onClick={() => updateItem(item.product.id, Math.max(1, item.quantity - 1))}
                  disabled={item.quantity <= 1}
                  className="flex h-8 w-8 items-center justify-center text-slate-600 hover:bg-slate-100 disabled:text-slate-300"
                  aria-label="Disminuir cantidad"
                >
                  <Minus className="h-3.5 w-3.5" />
                </button>
                <span className="w-8 text-center text-sm font-medium text-slate-900">
                  {item.quantity}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    updateItem(item.product.id, Math.min(item.product.stock, item.quantity + 1))
                  }
                  disabled={item.quantity >= item.product.stock}
                  className="flex h-8 w-8 items-center justify-center text-slate-600 hover:bg-slate-100 disabled:text-slate-300"
                  aria-label="Aumentar cantidad"
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>

              <p className="w-24 text-right font-semibold text-slate-900">
                {formatCurrency(item.quantity * item.product.price)}
              </p>

              <button
                onClick={() => removeItem(item.product.id)}
                className="flex h-8 w-8 items-center justify-center rounded-md text-slate-400 hover:bg-red-50 hover:text-red-600"
                aria-label="Quitar del carrito"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-5">
        <span className="text-lg font-semibold text-slate-900">Total</span>
        <span className="text-lg font-bold text-indigo-600">{formatCurrency(total)}</span>
      </div>

      <Link to="/checkout" className="ml-auto">
        <Button>Continuar al pago</Button>
      </Link>
    </div>
  )
}
