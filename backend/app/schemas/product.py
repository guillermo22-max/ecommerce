from decimal import Decimal

from pydantic import BaseModel, ConfigDict


class ProductImageBase(BaseModel):
    url: str
    alt_text: str | None = None
    position: int = 0


class ProductImageCreate(ProductImageBase):
    pass


class ProductImageRead(ProductImageBase):
    model_config = ConfigDict(from_attributes=True)

    id: int


class ProductBase(BaseModel):
    name: str
    slug: str
    description: str | None = None
    sku: str
    price: Decimal
    stock: int = 0
    is_active: bool = True
    category_id: int | None = None


class ProductCreate(ProductBase):
    images: list[ProductImageCreate] = []


class ProductUpdate(BaseModel):
    name: str | None = None
    slug: str | None = None
    description: str | None = None
    sku: str | None = None
    price: Decimal | None = None
    stock: int | None = None
    is_active: bool | None = None
    category_id: int | None = None


class ProductRead(ProductBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    images: list[ProductImageRead] = []
