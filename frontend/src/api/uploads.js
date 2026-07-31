import { request } from './client'

export function uploadImage(file) {
  const formData = new FormData()
  formData.append('file', file)
  return request('/uploads/images', { method: 'POST', formData })
}
