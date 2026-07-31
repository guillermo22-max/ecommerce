import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { deleteOrder, listAllOrders, updateOrderStatus } from '../../api/orders'
import { ApiError } from '../../api/client'
import { Spinner } from '../../components/ui/Spinner'
import { formatCurrency } from '../../lib/format'

const STATUS_OPTIONS = [
  { value: 'pending', label: 'Pendiente' },
  { value: 'paid', label: 'Pagado' },
  { value: 'shipped', label: 'Enviado' },
  { value: 'delivered', label: 'Entregado' },
  { value: 'cancelled', label: 'Cancelado' },
]

export function AdminOrdersPage() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [updatingId, setUpdatingId] = useState(null)
  const [deletingId, setDeletingId] = useState(null)

  async function load() {
    setLoading(true)
    setError('')
    try {
      setOrders(await listAllOrders())
    } catch {
      setError('No se pudieron cargar los pedidos.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  async function handleStatusChange(order, newStatus) {
    setUpdatingId(order.id)
    setError('')
    try {
      const updated = await updateOrderStatus(order.id, newStatus)
      setOrders((prev) => prev.map((o) => (o.id === order.id ? updated : o)))
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo actualizar el estado.')
    } finally {
      setUpdatingId(null)
    }
  }

  async function handleDelete(order) {
    if (!window.confirm(`¿Eliminar el pedido #${order.id}? Esta acción no se puede deshacer.`)) {
      return
    }
    setDeletingId(order.id)
    setError('')
    try {
      await deleteOrder(order.id)
      setOrders((prev) => prev.filter((o) => o.id !== order.id))
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo eliminar el pedido.')
    } finally {
      setDeletingId(null)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-bold text-slate-900">Pedidos</h1>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase text-slate-500">
            <tr>
              <th className="px-4 py-3">Pedido</th>
              <th className="px-4 py-3">Cliente</th>
              <th className="px-4 py-3">Total</th>
              <th className="px-4 py-3">Estado</th>
              <th className="px-4 py-3 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {orders.map((order) => (
              <tr key={order.id}>
                <td className="px-4 py-3 font-medium text-slate-900">
                  <Link to={`/orders/${order.id}`} className="hover:underline">
                    #{order.id}
                  </Link>
                </td>
                <td className="px-4 py-3 text-slate-500">
                  {order.user.full_name ?? order.user.email}
                </td>
                <td className="px-4 py-3 text-slate-900">{formatCurrency(order.total_amount)}</td>
                <td className="px-4 py-3">
                  <select
                    value={order.status}
                    onChange={(event) => handleStatusChange(order, event.target.value)}
                    disabled={updatingId === order.id}
                    className="rounded-md border border-slate-300 bg-white px-2 py-1.5 text-xs font-medium text-slate-700 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  >
                    {STATUS_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex justify-end gap-3">
                    <Link to={`/orders/${order.id}`} className="font-medium text-slate-700 hover:underline">
                      Ver
                    </Link>
                    <button
                      onClick={() => handleDelete(order)}
                      disabled={deletingId === order.id}
                      className="font-medium text-red-600 hover:underline disabled:text-red-300"
                    >
                      Eliminar
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {orders.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                  No hay pedidos todavía.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
