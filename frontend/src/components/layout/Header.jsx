import { LayoutDashboard, LogOut, Package, ShoppingCart, Store, User } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { useCart } from '../../hooks/useCart'

export function Header() {
  const { user, logout } = useAuth()
  const { itemCount } = useCart()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/')
  }

  return (
    <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <Link to="/" className="flex items-center gap-2 text-lg font-bold text-slate-900">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white">
            <Store className="h-4.5 w-4.5" strokeWidth={2.25} />
          </span>
          Ecommerce
        </Link>

        <nav className="flex items-center gap-1 text-sm font-medium text-slate-600">
          <Link
            to="/"
            className="rounded-md px-3 py-2 transition-colors hover:bg-slate-100 hover:text-slate-900"
          >
            Productos
          </Link>
          {user && (
            <Link
              to="/orders"
              className="hidden items-center gap-1.5 rounded-md px-3 py-2 transition-colors hover:bg-slate-100 hover:text-slate-900 sm:flex"
            >
              <Package className="h-4 w-4" />
              Mis pedidos
            </Link>
          )}
          {user?.is_superuser && (
            <Link
              to="/admin/products"
              className="hidden items-center gap-1.5 rounded-md px-3 py-2 transition-colors hover:bg-slate-100 hover:text-slate-900 sm:flex"
            >
              <LayoutDashboard className="h-4 w-4" />
              Panel admin
            </Link>
          )}

          <Link
            to="/cart"
            className="relative flex items-center rounded-md p-2 text-slate-700 transition-colors hover:bg-slate-100 hover:text-slate-900"
            aria-label="Carrito"
          >
            <ShoppingCart className="h-5 w-5" />
            {itemCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-indigo-600 px-1 text-[10px] font-semibold text-white">
                {itemCount}
              </span>
            )}
          </Link>

          <div className="ml-1 flex items-center gap-2 border-l border-slate-200 pl-3">
            {user ? (
              <>
                <span className="hidden items-center gap-1.5 text-slate-500 md:flex">
                  <User className="h-4 w-4" />
                  {user.full_name ?? user.email}
                </span>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 rounded-md px-3 py-2 transition-colors hover:bg-slate-100 hover:text-slate-900"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="hidden sm:inline">Cerrar sesión</span>
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="rounded-md px-3 py-2 transition-colors hover:bg-slate-100 hover:text-slate-900"
                >
                  Iniciar sesión
                </Link>
                <Link
                  to="/register"
                  className="rounded-md bg-indigo-600 px-3 py-2 text-white shadow-sm transition-colors hover:bg-indigo-700"
                >
                  Registrarse
                </Link>
              </>
            )}
          </div>
        </nav>
      </div>
    </header>
  )
}
