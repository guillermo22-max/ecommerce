import { UserPlus } from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ApiError } from '../api/client'
import { Button } from '../components/ui/Button'
import { InputField } from '../components/ui/InputField'
import { useAuth } from '../hooks/useAuth'

export function RegisterPage() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    setSubmitting(true)
    setError('')
    try {
      await register({ fullName, email, password })
      navigate('/')
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo crear la cuenta.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="mx-auto flex max-w-sm flex-col items-center gap-6 py-8">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-50 text-indigo-600">
        <UserPlus className="h-6 w-6" />
      </div>

      <div className="w-full rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <h1 className="text-center text-2xl font-bold text-slate-900">Crear cuenta</h1>
        <p className="mt-1 text-center text-sm text-slate-500">
          Regístrate para empezar a comprar
        </p>

        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
          {error && (
            <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
          )}

          <InputField
            id="fullName"
            label="Nombre completo"
            value={fullName}
            onChange={(event) => setFullName(event.target.value)}
            required
          />
          <InputField
            id="email"
            type="email"
            label="Correo electrónico"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
          <InputField
            id="password"
            type="password"
            label="Contraseña"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            minLength={8}
            required
          />

          <Button type="submit" disabled={submitting} className="mt-2">
            {submitting ? 'Creando cuenta...' : 'Registrarse'}
          </Button>
        </form>
      </div>

      <p className="text-sm text-slate-600">
        ¿Ya tienes cuenta?{' '}
        <Link to="/login" className="font-medium text-indigo-600 hover:underline">
          Inicia sesión
        </Link>
      </p>
    </div>
  )
}
