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

## Desplegar en Render (gratis)

El archivo [`render.yaml`](render.yaml) es un **Blueprint** de Render que crea de un solo golpe:

- Una base de datos PostgreSQL (`guillermo-ecommerce-db`)
- El backend FastAPI (`guillermo-ecommerce-backend`) — corre `alembic upgrade head` antes de cada deploy
- El frontend (`guillermo-ecommerce-frontend`) como sitio estático, con la SPA configurada para React Router

### Pasos

1. Sube el repo a GitHub (ya está en `main`/`dev`).
2. En [Render](https://dashboard.render.com/), **New → Blueprint** y selecciona este repositorio.
3. Render detecta `render.yaml` y muestra los tres recursos a crear. Antes de aplicar, completa las variables marcadas como secretas: `FIRST_SUPERUSER_EMAIL` y `FIRST_SUPERUSER_PASSWORD` (para el backend).
4. Aplica el Blueprint. `SECRET_KEY` se genera automáticamente y las credenciales de Postgres se inyectan solas desde la base de datos.
5. Cuando el backend termine de desplegar, crea el superusuario ejecutando una vez, desde la pestaña **Shell** del servicio backend en Render:

   ```bash
   uv run python scripts/create_superuser.py
   ```

### Verifica las URLs después del primer deploy

Los nombres de servicio en Render son únicos globalmente; si `guillermo-ecommerce-backend`/`-frontend` ya estuvieran tomados, Render les asignará otra URL. Revisa las URLs reales asignadas y, si difieren, actualiza en el dashboard:

- `BACKEND_CORS_ORIGINS` (en el backend) → URL real del frontend
- `VITE_API_URL` (en el frontend) → URL real del backend + `/api/v1`

y vuelve a desplegar ambos servicios.

### Limitaciones del plan gratuito

- La base de datos Postgres free de Render **expira a los 30 días** (hay que recrearla o pasar a un plan pago).
- Los servicios web free se **duermen tras ~15 min sin tráfico** y tardan unos segundos en despertar en la siguiente petición.
- El plan free **no incluye disco persistente**: las imágenes subidas desde el panel admin (`backend/uploads/`) se pierden en cada redeploy o reinicio. Para persistirlas de verdad hace falta un disco pago en Render o mover el guardado a un storage externo (S3, Cloudflare R2, etc.).
