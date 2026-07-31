import { LayoutGrid, Package, Tags } from 'lucide-react'
import { NavLink, Outlet } from 'react-router-dom'

const navItems = [
  { to: '/admin/products', label: 'Productos', icon: LayoutGrid },
  { to: '/admin/categories', label: 'Categorías', icon: Tags },
  { to: '/admin/orders', label: 'Pedidos', icon: Package },
]

export function AdminLayout() {
  return (
    <div className="grid gap-8 md:grid-cols-[200px_1fr]">
      <aside className="flex flex-col gap-1">
        <h2 className="mb-2 px-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
          Panel admin
        </h2>
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                isActive ? 'bg-indigo-600 text-white' : 'text-slate-700 hover:bg-slate-100'
              }`
            }
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </NavLink>
        ))}
      </aside>

      <div>
        <Outlet />
      </div>
    </div>
  )
}
