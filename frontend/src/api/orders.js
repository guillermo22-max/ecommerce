import { api } from './client'

export function listOrders() {
  return api.get('/orders/')
}

export function listAllOrders() {
  return api.get('/orders/admin?limit=200')
}

export function getOrder(id) {
  return api.get(`/orders/${id}`)
}

export function checkout({ shippingAddress }) {
  return api.post('/orders/checkout', { shipping_address: shippingAddress })
}

export function updateOrderStatus(id, status) {
  return api.patch(`/orders/${id}/status`, { status })
}

export function deleteOrder(id) {
  return api.delete(`/orders/${id}`)
}
