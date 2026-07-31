# Ecommerce

Aplicación de e-commerce full-stack: API en **FastAPI** + **PostgreSQL** y storefront en **React** + **Vite** + **Tailwind CSS**, con panel de administración incluido.

## Características

- Catálogo de productos con búsqueda, filtro por categoría e imágenes.
- Autenticación con JWT (registro / inicio de sesión).
- Carrito de compras persistente por usuario.
- Checkout en dos pasos: dirección de envío (con validación) y una pasarela de pago **simulada** (sin procesar cargos reales).
- Historial y detalle de pedidos, con imagen del producto.
- **Panel de administración** (solo superusuarios): CRUD de productos (con subida de imágenes desde archivos locales) y categorías, y gestión de pedidos (cambiar estado, eliminar).

## Stack

| | |
|---|---|
| **Backend** | FastAPI, SQLAlchemy 2.0, PostgreSQL, Alembic, Pydantic v2, JWT (`python-jose`), `pwdlib` (bcrypt), gestionado con [uv](https://docs.astral.sh/uv/) |
| **Frontend** | React 19, Vite, Tailwind CSS v4, React Router, `lucide-react` |

## Estructura del proyecto

```
ecommerce/
├── backend/     # API FastAPI — ver backend/README.md
└── frontend/    # Storefront + panel admin — ver frontend/README.md
```

## Puesta en marcha rápida

Requisitos: Python 3.12+, [uv](https://docs.astral.sh/uv/), Node.js 20+, PostgreSQL (con una base de datos ya creada).

```bash
# 1. Backend
cd backend
cp .env.example .env      # ajusta las credenciales de tu base de datos
uv sync
uv run alembic upgrade head
uv run uvicorn app.main:app --reload

# 2. Frontend (en otra terminal)
cd frontend
npm install
npm run dev
```

- Frontend: http://localhost:5173
- API + documentación interactiva: http://127.0.0.1:8000/docs

Para crear el primer superusuario y acceder al panel admin, define `FIRST_SUPERUSER_EMAIL` / `FIRST_SUPERUSER_PASSWORD` en `backend/.env` y ejecuta:

```bash
cd backend
uv run python scripts/create_superuser.py
```

Instrucciones detalladas, estructura interna y notas de diseño de cada parte en [`backend/README.md`](backend/README.md) y [`frontend/README.md`](frontend/README.md).
