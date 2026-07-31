export function Spinner({ className = '' }) {
  return (
    <div
      role="status"
      aria-label="Cargando"
      className={`h-5 w-5 animate-spin rounded-full border-2 border-slate-200 border-t-indigo-600 ${className}`}
    />
  )
}
