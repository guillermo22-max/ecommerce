from sqlalchemy import select
from sqlalchemy.orm import Session

from app.crud.base import CRUDBase
from app.models.product import Product, ProductImage
from app.schemas.product import ProductCreate, ProductUpdate


class CRUDProduct(CRUDBase[Product, ProductCreate, ProductUpdate]):
    def get_by_slug(self, db: Session, *, slug: str) -> Product | None:
        stmt = select(Product).where(Product.slug == slug)
        return db.execute(stmt).scalar_one_or_none()

    def get_by_sku(self, db: Session, *, sku: str) -> Product | None:
        stmt = select(Product).where(Product.sku == sku)
        return db.execute(stmt).scalar_one_or_none()

    def create(self, db: Session, *, obj_in: ProductCreate) -> Product:
        data = obj_in.model_dump(exclude={"images"})
        db_obj = Product(**data)
        db_obj.images = [ProductImage(**image.model_dump()) for image in obj_in.images]
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def get_by_category(
        self, db: Session, *, category_id: int, skip: int = 0, limit: int = 100
    ) -> list[Product]:
        stmt = (
            select(Product)
            .where(Product.category_id == category_id)
            .offset(skip)
            .limit(limit)
        )
        return list(db.execute(stmt).scalars().all())

    def search(self, db: Session, *, query: str, skip: int = 0, limit: int = 100) -> list[Product]:
        stmt = (
            select(Product)
            .where(Product.name.ilike(f"%{query}%"))
            .offset(skip)
            .limit(limit)
        )
        return list(db.execute(stmt).scalars().all())


product = CRUDProduct(Product)
