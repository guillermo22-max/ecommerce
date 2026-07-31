from sqlalchemy import select
from sqlalchemy.orm import Session

from app.crud.base import CRUDBase
from app.models.address import Address
from app.schemas.address import AddressCreate, AddressUpdate


class CRUDAddress(CRUDBase[Address, AddressCreate, AddressUpdate]):
    def get_by_user(self, db: Session, *, user_id: int) -> list[Address]:
        stmt = select(Address).where(Address.user_id == user_id)
        return list(db.execute(stmt).scalars().all())


address = CRUDAddress(Address)
