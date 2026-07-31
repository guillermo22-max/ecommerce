# Ecommerce Frontend

Storefront construido con **React 19**, **Vite** y **Tailwind CSS v4**.

## Estructura del proyecto

```
frontend/
├── src/
│   ├── main.jsx              # Entry point: BrowserRouter + AuthProvider + CartProvider
│   ├── App.jsx                # Definición de rutas
│   ├── index.css              # Import de Tailwind
│   ├── api/                   # Cliente fetch + funciones por recurso (auth, products, cart, orders...)
│   ├── context/                # AuthContext y CartContext (estado global)
│   ├── hooks/                  # useAuth, useCart
│   ├── components/
│   │   ├── layout/             # Header, Footer, Layout (con <Outlet />)
│   │   ├── ui/                  # Button, InputField, Spinner
│   │   └── products/            # ProductCard, ProductGrid
│   ├── pages/                   # Una página por ruta
│   ├── routes/                  # ProtectedRoute (rutas que requieren sesión)
│   └── lib/                     # Helpers (formato de moneda, localStorage)
├── vite.config.js               # Plugin de React + Tailwind, proxy /api -> backend
└── .env.example
```

## Requisitos

- Node.js 20+
- El backend corriendo (ver `../backend/README.md`)

## Configuración

```bash
npm install
```

En desarrollo no necesitas configurar `VITE_API_URL`: el servidor de Vite redirige `/api` al backend en `http://127.0.0.1:8000` (ver `vite.config.js`). Para producción, copia `.env.example` a `.env` y define `VITE_API_URL` apuntando a tu backend.

## Ejecutar en desarrollo

```bash
npm run dev
```

Abre `http://localhost:5173`. Asegúrate de que el backend esté corriendo en el puerto 8000.

## Build de producción

```bash
npm run build
npm run preview
```

## Rutas principales

| Ruta                | Descripción                                    | Requiere sesión |
|----------------------|------------------------------------------------|:---:|
| `/`                  | Catálogo de productos (búsqueda + categoría)   | No |
| `/products/:id`      | Detalle de producto                            | No |
| `/login`, `/register`| Autenticación                                  | No |
| `/cart`              | Carrito de compras                             | Sí |
| `/checkout`          | Formulario de dirección + confirmación de pedido| Sí |
| `/orders`            | Historial de pedidos                           | Sí |
| `/orders/:id`        | Detalle de un pedido                           | Sí |

## Notas de diseño

- `AuthContext` guarda el JWT en `localStorage` y expone `login`, `register`, `logout`.
- `CartContext` sincroniza el carrito con el backend en cada cambio (agregar, actualizar cantidad, quitar).
- `ProtectedRoute` redirige a `/login` si no hay sesión, preservando la ruta de origen.
- El cliente API (`src/api/client.js`) usa `fetch` nativo (sin axios) e inyecta el token JWT automáticamente.
