import { api } from './client'

export function listProducts({ q, categoryId, skip = 0, limit = 100 } = {}) {
  const params = new URLSearchParams()
  if (q) params.set('q', q)
  if (categoryId) params.set('category_id', categoryId)
  params.set('skip', skip)
  params.set('limit', limit)
  return api.get(`/products/?${params.toString()}`, { auth: false })
}

export function getProduct(id) {
  return api.get(`/products/${id}`, { auth: false })
}

export function createProduct(payload) {
  return api.post('/products/', payload)
}

export function updateProduct(id, payload) {
  return api.patch(`/products/${id}`, payload)
}

export function deleteProduct(id) {
  return api.delete(`/products/${id}`)
}

export function addProductImage(productId, payload) {
  return api.post(`/products/${productId}/images`, payload)
}

export function deleteProductImage(productId, imageId) {
  return api.delete(`/products/${productId}/images/${imageId}`)
}
