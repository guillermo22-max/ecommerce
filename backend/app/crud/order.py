from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.order import Order


class CRUDOrder:
    def get(self, db: Session, *, id: int) -> Order | None:
        return db.get(Order, id)

    def get_by_user(
        self, db: Session, *, user_id: int, skip: int = 0, limit: int = 100
    ) -> list[Order]:
        stmt = (
            select(Order)
            .where(Order.user_id == user_id)
            .order_by(Order.id.desc())
            .offset(skip)
            .limit(limit)
        )
        return list(db.execute(stmt).scalars().all())

    def get_all(self, db: Session, *, skip: int = 0, limit: int = 100) -> list[Order]:
        stmt = select(Order).order_by(Order.id.desc()).offset(skip).limit(limit)
        return list(db.execute(stmt).scalars().all())

    def remove(self, db: Session, *, id: int) -> None:
        order = db.get(Order, id)
        if order is not None:
            db.delete(order)
            db.commit()


order = CRUDOrder()
