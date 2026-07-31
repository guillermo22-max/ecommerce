from decimal import Decimal

from pydantic import BaseModel, ConfigDict

from app.models.order import OrderStatus
from app.schemas.address import AddressBase
from app.schemas.product import ProductImageRead


class OrderItemProduct(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    images: list[ProductImageRead] = []


class OrderItemRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    product_id: int
    quantity: int
    unit_price: Decimal
    product: OrderItemProduct


class OrderCreate(BaseModel):
    shipping_address: AddressBase


class OrderUserSummary(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    email: str
    full_name: str | None = None


class OrderRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    status: OrderStatus
    total_amount: Decimal
    shipping_full_name: str
    shipping_line1: str
    shipping_line2: str | None
    shipping_city: str
    shipping_state: str | None
    shipping_postal_code: str
    shipping_country: str
    items: list[OrderItemRead] = []
    user: OrderUserSummary


class OrderStatusUpdate(BaseModel):
    status: OrderStatus
