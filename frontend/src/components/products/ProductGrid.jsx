import { PackageSearch } from 'lucide-react'
import { ProductCard } from './ProductCard'

export function ProductGrid({ products }) {
  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 py-20 text-center">
        <PackageSearch className="h-10 w-10 text-slate-300" />
        <p className="text-slate-500">No se encontraron productos.</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  )
}
