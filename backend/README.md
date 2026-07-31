# Ecommerce Backend

API backend para una tienda en línea, construida con **FastAPI**, **SQLAlchemy 2.0** y **PostgreSQL**, gestionada con **uv**.

## Estructura del proyecto

```
backend/
├── app/
│   ├── main.py                 # Punto de entrada de la aplicación FastAPI
│   ├── core/                   # Configuración, seguridad (JWT/hashing), logging
│   ├── db/                     # Base declarativa y sesión de SQLAlchemy
│   ├── models/                 # Modelos ORM (User, Product, Category, Order, Cart, Address...)
│   ├── schemas/                # Esquemas Pydantic (request/response)
│   ├── crud/                   # Capa de acceso a datos (CRUD genérico + específico)
│   ├── services/                # Lógica de negocio (checkout, etc.)
│   └── api/
│       ├── deps.py             # Dependencias compartidas (DB session, usuario actual)
│       └── v1/
│           ├── router.py       # Router principal que agrega todos los endpoints
│           └── endpoints/      # auth, users, addresses, categories, products, cart, orders
├── alembic/                     # Migraciones de base de datos
├── scripts/
│   └── create_superuser.py     # Crea el primer superusuario
├── tests/                       # Pruebas (pytest)
├── .env                          # Variables de entorno (NO subir a git)
├── .env.example                  # Plantilla de variables de entorno
├── alembic.ini
└── pyproject.toml
```

## Requisitos

- Python 3.12+
- [uv](https://docs.astral.sh/uv/)
- PostgreSQL con la base de datos `ecommerce` ya creada

## Configuración

1. Copia `.env.example` a `.env` y ajusta las credenciales si es necesario (ya viene preconfigurado para la base de datos local `ecommerce`).
2. Instala las dependencias:

   ```bash
   uv sync
   ```

## Migraciones de base de datos

```bash
# Aplicar migraciones existentes
uv run alembic upgrade head

# Crear una nueva migración tras modificar modelos
uv run alembic revision --autogenerate -m "descripción del cambio"
```

## Ejecutar el servidor

```bash
uv run uvicorn app.main:app --reload
```

- Documentación interactiva: http://127.0.0.1:8000/docs
- Health check: http://127.0.0.1:8000/health

## Crear un superusuario

Define `FIRST_SUPERUSER_EMAIL` y `FIRST_SUPERUSER_PASSWORD` en `.env` y ejecuta:

```bash
uv run python scripts/create_superuser.py
```

## Pruebas

```bash
uv run pytest
```

## Módulos de la API (`/api/v1`)

| Recurso     | Descripción                                              |
|-------------|-----------------------------------------------------------|
| `/auth`     | Registro e inicio de sesión (OAuth2 password flow + JWT) |
| `/users`    | Datos del usuario autenticado                             |
| `/addresses`| Direcciones de envío del usuario                          |
| `/categories`| CRUD de categorías (jerárquicas, escritura solo admin)  |
| `/products` | CRUD de productos, búsqueda y filtrado por categoría      |
| `/cart`     | Carrito de compras del usuario autenticado                |
| `/orders`   | Checkout (carrito → pedido) e historial de pedidos        |

## Notas de diseño

- Autenticación basada en JWT (`python-jose`) con contraseñas hasheadas con `pwdlib` (bcrypt).
- El checkout (`POST /orders/checkout`) valida stock y estado activo de cada producto, descuenta inventario y vacía el carrito de forma atómica.
- La capa `crud/` es agnóstica a HTTP; la capa `api/` solo traduce peticiones/respuestas.
