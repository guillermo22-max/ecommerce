import { api } from './client'

export function listCategories() {
  return api.get('/categories/', { auth: false })
}

export function getCategory(id) {
  return api.get(`/categories/${id}`, { auth: false })
}

export function createCategory(payload) {
  return api.post('/categories/', payload)
}

export function updateCategory(id, payload) {
  return api.patch(`/categories/${id}`, payload)
}

export function deleteCategory(id) {
  return api.delete(`/categories/${id}`)
}
