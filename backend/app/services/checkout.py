from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.crud.cart import cart as crud_cart
from app.models.cart import Cart
from app.models.order import Order, OrderItem, OrderStatus
from app.schemas.address import AddressBase


def checkout(db: Session, *, user_id: int, cart: Cart, shipping_address: AddressBase) -> Order:
    """Convert a user's cart into an order, decrementing stock atomically.

    Called only after the (simulated) payment step succeeds, so the order
    is created already paid.
    """
    if not cart.items:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, detail="El carrito está vacío")

    order_items: list[OrderItem] = []
    total_amount = 0
    for item in cart.items:
        product = item.product
        if not product.is_active:
            raise HTTPException(
                status.HTTP_400_BAD_REQUEST,
                detail=f"El producto '{product.name}' ya no está disponible",
            )
        if product.stock < item.quantity:
            raise HTTPException(
                status.HTTP_400_BAD_REQUEST,
                detail=f"Stock insuficiente para '{product.name}' (disponible: {product.stock})",
            )
        product.stock -= item.quantity
        total_amount += product.price * item.quantity
        order_items.append(
            OrderItem(product_id=product.id, quantity=item.quantity, unit_price=product.price)
        )

    order = Order(
        user_id=user_id,
        status=OrderStatus.PAID,
        total_amount=total_amount,
        items=order_items,
        **_shipping_fields(shipping_address),
    )
    db.add(order)
    crud_cart.clear(db, cart=cart)
    db.commit()
    db.refresh(order)
    return order


def _shipping_fields(address: AddressBase) -> dict:
    return {
        "shipping_full_name": address.full_name,
        "shipping_line1": address.line1,
        "shipping_line2": address.line2,
        "shipping_city": address.city,
        "shipping_state": address.state,
        "shipping_postal_code": address.postal_code,
        "shipping_country": address.country,
    }
