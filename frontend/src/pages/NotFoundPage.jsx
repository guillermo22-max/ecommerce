import { Link } from 'react-router-dom'

export function NotFoundPage() {
  return (
    <div className="flex flex-col items-center gap-4 py-16 text-center">
      <h1 className="text-3xl font-bold text-slate-900">404</h1>
      <p className="text-slate-600">La página que buscas no existe.</p>
      <Link to="/" className="font-medium text-slate-900 hover:underline">
        Volver al inicio
      </Link>
    </div>
  )
}
