from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_active_user, get_db
from app.crud.cart import cart as crud_cart
from app.crud.product import product as crud_product
from app.models.user import User
from app.schemas.cart import CartItemCreate, CartItemUpdate, CartRead

router = APIRouter()


@router.get("/", response_model=CartRead)
def read_cart(
    db: Session = Depends(get_db), current_user: User = Depends(get_current_active_user)
) -> CartRead:
    return crud_cart.get_or_create_for_user(db, user_id=current_user.id)


@router.post("/items", response_model=CartRead, status_code=status.HTTP_201_CREATED)
def add_item_to_cart(
    item_in: CartItemCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> CartRead:
    product = crud_product.get(db, id=item_in.product_id)
    if product is None or not product.is_active:
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail="Producto no encontrado")
    cart = crud_cart.get_or_create_for_user(db, user_id=current_user.id)
    crud_cart.add_item(
        db, cart_id=cart.id, product_id=item_in.product_id, quantity=item_in.quantity
    )
    db.refresh(cart)
    return cart


@router.patch("/items/{product_id}", response_model=CartRead)
def update_cart_item(
    product_id: int,
    item_in: CartItemUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> CartRead:
    cart = crud_cart.get_or_create_for_user(db, user_id=current_user.id)
    item = crud_cart.get_item(db, cart_id=cart.id, product_id=product_id)
    if item is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail="El producto no está en el carrito")
    crud_cart.update_item_quantity(db, item=item, quantity=item_in.quantity)
    db.refresh(cart)
    return cart


@router.delete("/items/{product_id}", response_model=CartRead)
def remove_cart_item(
    product_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> CartRead:
    cart = crud_cart.get_or_create_for_user(db, user_id=current_user.id)
    item = crud_cart.get_item(db, cart_id=cart.id, product_id=product_id)
    if item is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail="El producto no está en el carrito")
    crud_cart.remove_item(db, item=item)
    db.refresh(cart)
    return cart
