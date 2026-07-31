from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_active_superuser, get_current_active_user, get_db
from app.crud.cart import cart as crud_cart
from app.crud.order import order as crud_order
from app.models.order import Order
from app.models.user import User
from app.schemas.order import OrderCreate, OrderRead, OrderStatusUpdate
from app.services.checkout import checkout as checkout_service

router = APIRouter()


@router.get("/", response_model=list[OrderRead])
def list_my_orders(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> list[OrderRead]:
    return crud_order.get_by_user(db, user_id=current_user.id, skip=skip, limit=limit)


@router.get(
    "/admin",
    response_model=list[OrderRead],
    dependencies=[Depends(get_current_active_superuser)],
)
def list_all_orders(
    skip: int = 0, limit: int = 100, db: Session = Depends(get_db)
) -> list[OrderRead]:
    return crud_order.get_all(db, skip=skip, limit=limit)


@router.get("/{order_id}", response_model=OrderRead)
def get_order(
    order_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> OrderRead:
    order = db.get(Order, order_id)
    if order is None or (order.user_id != current_user.id and not current_user.is_superuser):
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail="Pedido no encontrado")
    return order


@router.post("/checkout", response_model=OrderRead, status_code=status.HTTP_201_CREATED)
def checkout(
    order_in: OrderCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> OrderRead:
    cart = crud_cart.get_or_create_for_user(db, user_id=current_user.id)
    return checkout_service(
        db, user_id=current_user.id, cart=cart, shipping_address=order_in.shipping_address
    )


@router.patch(
    "/{order_id}/status",
    response_model=OrderRead,
    dependencies=[Depends(get_current_active_superuser)],
)
def update_order_status(
    order_id: int, status_in: OrderStatusUpdate, db: Session = Depends(get_db)
) -> OrderRead:
    order = db.get(Order, order_id)
    if order is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail="Pedido no encontrado")
    order.status = status_in.status
    db.add(order)
    db.commit()
    db.refresh(order)
    return order


@router.delete(
    "/{order_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    dependencies=[Depends(get_current_active_superuser)],
)
def delete_order(order_id: int, db: Session = Depends(get_db)) -> None:
    if crud_order.get(db, id=order_id) is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail="Pedido no encontrado")
    crud_order.remove(db, id=order_id)
