import { ImageOff, PackageSearch } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { listOrders } from '../api/orders'
import { StatusBadge } from '../components/ui/StatusBadge'
import { Spinner } from '../components/ui/Spinner'
import { formatCurrency } from '../lib/format'

function orderSummary(items) {
  if (items.length === 0) return ''
  const first = items[0].product.name
  return items.length > 1 ? `${first} y ${items.length - 1} más` : first
}

export function OrdersPage() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    listOrders()
      .then(setOrders)
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner />
      </div>
    )
  }

  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 py-20 text-center">
        <PackageSearch className="h-10 w-10 text-slate-300" />
        <p className="text-slate-500">Aún no tienes pedidos.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold text-slate-900">Mis pedidos</h1>

      <div className="flex flex-col divide-y divide-slate-200 rounded-xl border border-slate-200 bg-white">
        {orders.map((order) => {
          const image = order.items[0]?.product.images?.[0]
          return (
            <Link
              key={order.id}
              to={`/orders/${order.id}`}
              className="flex items-center gap-4 p-4 transition-colors hover:bg-slate-50"
            >
              <div className="h-14 w-14 flex-shrink-0 overflow-hidden rounded-md bg-slate-100">
                {image ? (
                  <img src={image.url} alt={order.items[0].product.name} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-slate-300">
                    <ImageOff className="h-5 w-5" />
                  </div>
                )}
              </div>

              <div className="flex flex-1 flex-col gap-1">
                <p className="font-medium text-slate-900">{orderSummary(order.items)}</p>
                <StatusBadge status={order.status} />
              </div>

              <p className="font-semibold text-slate-900">{formatCurrency(order.total_amount)}</p>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
