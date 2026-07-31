import { ImageOff, MapPin, Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { deleteOrder, getOrder, updateOrderStatus } from '../api/orders'
import { ApiError } from '../api/client'
import { SelectField } from '../components/ui/SelectField'
import { StatusBadge } from '../components/ui/StatusBadge'
import { Spinner } from '../components/ui/Spinner'
import { useAuth } from '../hooks/useAuth'
import { formatCurrency } from '../lib/format'

const STATUS_OPTIONS = [
  { value: 'pending', label: 'Pendiente' },
  { value: 'paid', label: 'Pagado' },
  { value: 'shipped', label: 'Enviado' },
  { value: 'delivered', label: 'Entregado' },
  { value: 'cancelled', label: 'Cancelado' },
]

export function OrderDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [updatingStatus, setUpdatingStatus] = useState(false)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    getOrder(id)
      .then(setOrder)
      .catch(() => setError('No se encontró el pedido.'))
      .finally(() => setLoading(false))
  }, [id])

  async function handleStatusChange(event) {
    const newStatus = event.target.value
    setUpdatingStatus(true)
    setError('')
    try {
      const updated = await updateOrderStatus(id, newStatus)
      setOrder(updated)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo actualizar el estado.')
    } finally {
      setUpdatingStatus(false)
    }
  }

  async function handleDelete() {
    if (!window.confirm(`¿Eliminar el pedido #${order.id}? Esta acción no se puede deshacer.`)) {
      return
    }
    setDeleting(true)
    setError('')
    try {
      await deleteOrder(id)
      navigate('/admin/orders')
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo eliminar el pedido.')
      setDeleting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner />
      </div>
    )
  }

  if (error && !order) {
    return <p className="py-12 text-center text-red-600">{error}</p>
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold text-slate-900">Pedido #{order.id}</h1>
          <StatusBadge status={order.status} />
        </div>

        {user?.is_superuser && (
          <div className="flex items-center gap-3">
            <SelectField
              id="status"
              label="Cambiar estado"
              value={order.status}
              onChange={handleStatusChange}
              disabled={updatingStatus}
              className="w-40"
            >
              {STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </SelectField>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="mt-6 flex h-9 items-center gap-1.5 rounded-md px-3 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
            >
              <Trash2 className="h-4 w-4" />
              {deleting ? 'Eliminando...' : 'Eliminar pedido'}
            </button>
          </div>
        )}
      </div>

      {error && <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}

      {user?.is_superuser && (
        <p className="text-sm text-slate-500">
          Cliente: <span className="font-medium text-slate-700">{order.user.full_name ?? order.user.email}</span>
        </p>
      )}

      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="mb-2 flex items-center gap-1.5 font-semibold text-slate-900">
          <MapPin className="h-4 w-4 text-indigo-500" />
          Dirección de envío
        </h2>
        <p className="text-sm text-slate-600">{order.shipping_full_name}</p>
        <p className="text-sm text-slate-600">
          {order.shipping_line1}
          {order.shipping_line2 ? `, ${order.shipping_line2}` : ''}
        </p>
        <p className="text-sm text-slate-600">
          {order.shipping_city}
          {order.shipping_state ? `, ${order.shipping_state}` : ''} {order.shipping_postal_code}
        </p>
        <p className="text-sm text-slate-600">{order.shipping_country}</p>
      </div>

      <div className="flex flex-col divide-y divide-slate-100 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        {order.items.map((item) => {
          const image = item.product.images?.[0]
          return (
            <div key={item.id} className="flex items-center gap-4 py-3">
              <div className="h-14 w-14 flex-shrink-0 overflow-hidden rounded-md bg-slate-100">
                {image ? (
                  <img src={image.url} alt={item.product.name} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-slate-300">
                    <ImageOff className="h-5 w-5" />
                  </div>
                )}
              </div>
              <span className="flex-1 text-sm text-slate-700">
                {item.product.name} × {item.quantity}
              </span>
              <span className="font-medium text-slate-900">
                {formatCurrency(item.quantity * item.unit_price)}
              </span>
            </div>
          )
        })}
        <div className="flex justify-between pt-3 text-base font-semibold text-slate-900">
          <span>Total</span>
          <span className="text-indigo-600">{formatCurrency(order.total_amount)}</span>
        </div>
      </div>
    </div>
  )
}
