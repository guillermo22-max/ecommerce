from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_active_user, get_db
from app.crud.address import address as crud_address
from app.models.address import Address
from app.models.user import User
from app.schemas.address import AddressCreate, AddressRead, AddressUpdate

router = APIRouter()


@router.get("/", response_model=list[AddressRead])
def list_addresses(
    db: Session = Depends(get_db), current_user: User = Depends(get_current_active_user)
) -> list[AddressRead]:
    return crud_address.get_by_user(db, user_id=current_user.id)


@router.post("/", response_model=AddressRead, status_code=status.HTTP_201_CREATED)
def create_address(
    address_in: AddressCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> AddressRead:
    db_obj = Address(**address_in.model_dump(), user_id=current_user.id)
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj


def _get_owned_address(db: Session, address_id: int, current_user: User):
    address = crud_address.get(db, id=address_id)
    if address is None or address.user_id != current_user.id:
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail="Dirección no encontrada")
    return address


@router.patch("/{address_id}", response_model=AddressRead)
def update_address(
    address_id: int,
    address_in: AddressUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> AddressRead:
    address = _get_owned_address(db, address_id, current_user)
    return crud_address.update(db, db_obj=address, obj_in=address_in)


@router.delete("/{address_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_address(
    address_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> None:
    _get_owned_address(db, address_id, current_user)
    crud_address.remove(db, id=address_id)
