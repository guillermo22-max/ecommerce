import { api } from './client'

export function getCart() {
  return api.get('/cart/')
}

export function addCartItem({ productId, quantity = 1 }) {
  return api.post('/cart/items', { product_id: productId, quantity })
}

export function updateCartItem({ productId, quantity }) {
  return api.patch(`/cart/items/${productId}`, { quantity })
}

export function removeCartItem(productId) {
  return api.delete(`/cart/items/${productId}`)
}
