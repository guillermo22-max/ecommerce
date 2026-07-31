import { ImageOff, ShoppingCart } from 'lucide-react'
import { Link } from 'react-router-dom'
import { formatCurrency } from '../../lib/format'

export function ProductCard({ product }) {
  const image = product.images?.[0]
  const outOfStock = product.stock === 0

  return (
    <Link
      to={`/products/${product.id}`}
      className="group relative flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white transition-all duration-200 hover:-translate-y-1 hover:border-slate-300 hover:shadow-lg"
    >
      <div className="relative aspect-square w-full overflow-hidden bg-slate-100">
        {image ? (
          <img
            src={image.url}
            alt={image.alt_text ?? product.name}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-slate-300">
            <ImageOff className="h-8 w-8" />
            <span className="text-xs text-slate-400">Sin imagen</span>
          </div>
        )}

        {outOfStock && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/70 backdrop-blur-[1px]">
            <span className="rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold text-white">
              Agotado
            </span>
          </div>
        )}

        <div className="pointer-events-none absolute bottom-2 right-2 flex h-9 w-9 translate-y-2 items-center justify-center rounded-full bg-indigo-600 text-white opacity-0 shadow-md transition-all duration-200 group-hover:translate-y-0 group-hover:opacity-100">
          <ShoppingCart className="h-4 w-4" />
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-1.5 p-4">
        <h3 className="line-clamp-2 text-sm font-medium text-slate-900">{product.name}</h3>
        <p className="mt-auto text-base font-bold text-indigo-600">
          {formatCurrency(product.price)}
        </p>
      </div>
    </Link>
  )
}
