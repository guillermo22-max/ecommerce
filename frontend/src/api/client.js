import { clearToken, getToken } from '../lib/storage'

export const UNAUTHORIZED_EVENT = 'auth:unauthorized'

const API_BASE_URL = import.meta.env.VITE_API_URL ?? '/api/v1'

export class ApiError extends Error {
  constructor(message, status, data) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.data = data
  }
}

async function parseErrorMessage(response) {
  try {
    const data = await response.json()
    if (typeof data.detail === 'string') return data.detail
    if (Array.isArray(data.detail)) {
      return data.detail.map((issue) => issue.msg).join(', ')
    }
    return response.statusText
  } catch {
    return response.statusText
  }
}

export async function request(
  path,
  { method = 'GET', body, form, formData, auth = true, headers = {} } = {},
) {
  const finalHeaders = { ...headers }
  if (auth) {
    const token = getToken()
    if (token) finalHeaders.Authorization = `Bearer ${token}`
  }

  let payload
  if (formData) {
    // Let the browser set the multipart Content-Type header (with boundary).
    payload = formData
  } else if (form) {
    payload = new URLSearchParams(form)
    finalHeaders['Content-Type'] = 'application/x-www-form-urlencoded'
  } else if (body !== undefined) {
    payload = JSON.stringify(body)
    finalHeaders['Content-Type'] = 'application/json'
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers: finalHeaders,
    body: payload,
  })

  if (!response.ok) {
    const message = await parseErrorMessage(response)
    if (response.status === 401 && auth) {
      clearToken()
      window.dispatchEvent(new Event(UNAUTHORIZED_EVENT))
    }
    throw new ApiError(message, response.status, null)
  }

  if (response.status === 204) return null
  return response.json()
}

export const api = {
  get: (path, options) => request(path, { ...options, method: 'GET' }),
  post: (path, body, options) => request(path, { ...options, method: 'POST', body }),
  patch: (path, body, options) => request(path, { ...options, method: 'PATCH', body }),
  delete: (path, options) => request(path, { ...options, method: 'DELETE' }),
}
