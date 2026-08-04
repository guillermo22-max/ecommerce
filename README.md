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

El archivo [`render.yaml`](render.yaml) es un **Blueprint** de Render que crea:

- El backend FastAPI (`ecommerce-backend`) — corre `alembic upgrade head` cada vez que arranca (deploy o al despertar del modo dormido; `upgrade head` no hace nada si ya está al día, así que es seguro repetirlo)
- El frontend (`ecommerce-frontend`) como sitio estático, con la SPA configurada para React Router

La base de datos **no** la crea Render (su plan gratis solo permite una Postgres gratuita por cuenta). En su lugar, usa un Postgres externo gratuito como [Neon](https://neon.tech) o [Supabase](https://supabase.com).

### Pasos

1. Crea un proyecto en Neon (o Supabase) y copia los datos de conexión: host, puerto, usuario, contraseña y nombre de la base de datos.
2. Sube el repo a GitHub (ya está en `main`/`dev`).
3. En [Render](https://dashboard.render.com/), **New → Blueprint** y selecciona este repositorio.
4. Render detecta `render.yaml` y te pide llenar las variables marcadas como secretas antes de aplicar: `POSTGRES_SERVER`, `POSTGRES_PORT`, `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB` (con los datos de Neon/Supabase) y `FIRST_SUPERUSER_EMAIL` / `FIRST_SUPERUSER_PASSWORD`.
5. Aplica el Blueprint. `SECRET_KEY` se genera automáticamente. `POSTGRES_SSLMODE=require` ya viene configurado (Neon y Supabase exigen TLS).
6. Cuando el backend termine de desplegar, crea el superusuario ejecutando una vez, desde la pestaña **Shell** del servicio backend en Render:

   ```bash
   uv run python scripts/create_superuser.py
   ```

### Verifica las URLs después del primer deploy

Los nombres de servicio en Render son únicos globalmente; si `ecommerce-backend`/`-frontend` ya estuvieran tomados, Render les asignará otra URL. Revisa las URLs reales asignadas y, si difieren, actualiza en el dashboard:

- `BACKEND_CORS_ORIGINS` (en el backend) → URL real del frontend
- `VITE_API_URL` (en el frontend) → URL real del backend + `/api/v1`

y vuelve a desplegar ambos servicios.

### Limitaciones del plan gratuito

- Render solo permite **una base de datos Postgres gratuita por cuenta** — por eso este Blueprint usa un proveedor externo (Neon/Supabase) en vez de crear la suya propia.
- El free tier de Neon/Supabase también tiene límites propios (la base se "suspende" tras un rato sin uso y tarda unos segundos en despertar en la siguiente consulta; hay topes de almacenamiento y cómputo). Revisa las condiciones vigentes en su documentación.
- Los servicios web free de Render se **duermen tras ~15 min sin tráfico** y tardan unos segundos en despertar en la siguiente petición.
- El plan free **no incluye disco persistente**: las imágenes subidas desde el panel admin (`backend/uploads/`) se pierden en cada redeploy o reinicio. Para persistirlas de verdad hace falta un disco pago en Render o mover el guardado a un storage externo (S3, Cloudflare R2, etc.).
