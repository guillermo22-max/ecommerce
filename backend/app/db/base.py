"""Import Base and all models so Alembic autogenerate can detect them."""

from app.db.base_class import Base
from app.models import (  # noqa: F401
    Address,
    Cart,
    CartItem,
    Category,
    Order,
    OrderItem,
    Product,
    ProductImage,
    User,
)

__all__ = ["Base"]
