import { Store } from 'lucide-react'

export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-3 px-4 py-8 text-sm text-slate-500 sm:flex-row sm:justify-between">
        <span className="flex items-center gap-2 font-semibold text-slate-700">
          <span className="flex h-6 w-6 items-center justify-center rounded-md bg-indigo-600 text-white">
            <Store className="h-3.5 w-3.5" strokeWidth={2.25} />
          </span>
          Ecommerce
        </span>
        <span>© {new Date().getFullYear()} Ecommerce. Todos los derechos reservados.</span>
      </div>
    </footer>
  )
}
