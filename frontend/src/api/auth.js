import { api, request } from './client'

export function register({ email, password, fullName }) {
  return api.post(
    '/auth/register',
    { email, password, full_name: fullName },
    { auth: false },
  )
}

export function login({ email, password }) {
  return request('/auth/login', {
    method: 'POST',
    form: { username: email, password },
    auth: false,
  })
}

export function getCurrentUser() {
  return api.get('/users/me')
}
