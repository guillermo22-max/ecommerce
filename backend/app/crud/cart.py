from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.cart import Cart, CartItem


class CRUDCart:
    def get_or_create_for_user(self, db: Session, *, user_id: int) -> Cart:
        stmt = select(Cart).where(Cart.user_id == user_id)
        cart = db.execute(stmt).scalar_one_or_none()
        if cart is None:
            cart = Cart(user_id=user_id)
            db.add(cart)
            db.commit()
            db.refresh(cart)
        return cart

    def get_item(self, db: Session, *, cart_id: int, product_id: int) -> CartItem | None:
        stmt = select(CartItem).where(
            CartItem.cart_id == cart_id, CartItem.product_id == product_id
        )
        return db.execute(stmt).scalar_one_or_none()

    def add_item(self, db: Session, *, cart_id: int, product_id: int, quantity: int) -> CartItem:
        item = self.get_item(db, cart_id=cart_id, product_id=product_id)
        if item is not None:
            item.quantity += quantity
        else:
            item = CartItem(cart_id=cart_id, product_id=product_id, quantity=quantity)
            db.add(item)
        db.commit()
        db.refresh(item)
        return item

    def update_item_quantity(self, db: Session, *, item: CartItem, quantity: int) -> CartItem:
        item.quantity = quantity
        db.add(item)
        db.commit()
        db.refresh(item)
        return item

    def remove_item(self, db: Session, *, item: CartItem) -> None:
        db.delete(item)
        db.commit()

    def clear(self, db: Session, *, cart: Cart) -> None:
        for item in list(cart.items):
            db.delete(item)
        db.commit()


cart = CRUDCart()
