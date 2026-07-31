from sqlalchemy import select
from sqlalchemy.orm import Session

from app.crud.base import CRUDBase
from app.models.category import Category
from app.schemas.category import CategoryCreate, CategoryUpdate


class CRUDCategory(CRUDBase[Category, CategoryCreate, CategoryUpdate]):
    def get_by_slug(self, db: Session, *, slug: str) -> Category | None:
        stmt = select(Category).where(Category.slug == slug)
        return db.execute(stmt).scalar_one_or_none()


category = CRUDCategory(Category)
