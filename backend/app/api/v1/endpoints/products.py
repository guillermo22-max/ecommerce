from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_active_superuser, get_db
from app.crud.product import product as crud_product
from app.models.product import ProductImage
from app.schemas.product import (
    ProductCreate,
    ProductImageCreate,
    ProductImageRead,
    ProductRead,
    ProductUpdate,
)

router = APIRouter()


@router.get("/", response_model=list[ProductRead])
def list_products(
    skip: int = 0,
    limit: int = 100,
    category_id: int | None = None,
    q: str | None = None,
    db: Session = Depends(get_db),
) -> list[ProductRead]:
    if q:
        return crud_product.search(db, query=q, skip=skip, limit=limit)
    if category_id is not None:
        return crud_product.get_by_category(db, category_id=category_id, skip=skip, limit=limit)
    return crud_product.get_multi(db, skip=skip, limit=limit)


@router.get("/{product_id}", response_model=ProductRead)
def get_product(product_id: int, db: Session = Depends(get_db)) -> ProductRead:
    product = crud_product.get(db, id=product_id)
    if product is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail="Producto no encontrado")
    return product


@router.post(
    "/",
    response_model=ProductRead,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(get_current_active_superuser)],
)
def create_product(product_in: ProductCreate, db: Session = Depends(get_db)) -> ProductRead:
    if crud_product.get_by_slug(db, slug=product_in.slug) is not None:
        raise HTTPException(
            status.HTTP_400_BAD_REQUEST, detail="Ya existe un producto con ese slug"
        )
    if crud_product.get_by_sku(db, sku=product_in.sku) is not None:
        raise HTTPException(
            status.HTTP_400_BAD_REQUEST, detail="Ya existe un producto con ese SKU"
        )
    return crud_product.create(db, obj_in=product_in)


@router.patch(
    "/{product_id}",
    response_model=ProductRead,
    dependencies=[Depends(get_current_active_superuser)],
)
def update_product(
    product_id: int, product_in: ProductUpdate, db: Session = Depends(get_db)
) -> ProductRead:
    product = crud_product.get(db, id=product_id)
    if product is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail="Producto no encontrado")
    if product_in.slug and product_in.slug != product.slug:
        existing = crud_product.get_by_slug(db, slug=product_in.slug)
        if existing is not None and existing.id != product_id:
            raise HTTPException(
                status.HTTP_400_BAD_REQUEST, detail="Ya existe un producto con ese slug"
            )
    if product_in.sku and product_in.sku != product.sku:
        existing = crud_product.get_by_sku(db, sku=product_in.sku)
        if existing is not None and existing.id != product_id:
            raise HTTPException(
                status.HTTP_400_BAD_REQUEST, detail="Ya existe un producto con ese SKU"
            )
    return crud_product.update(db, db_obj=product, obj_in=product_in)


@router.delete(
    "/{product_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    dependencies=[Depends(get_current_active_superuser)],
)
def delete_product(product_id: int, db: Session = Depends(get_db)) -> None:
    if crud_product.get(db, id=product_id) is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail="Producto no encontrado")
    crud_product.remove(db, id=product_id)


@router.post(
    "/{product_id}/images",
    response_model=ProductImageRead,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(get_current_active_superuser)],
)
def add_product_image(
    product_id: int, image_in: ProductImageCreate, db: Session = Depends(get_db)
) -> ProductImageRead:
    product = crud_product.get(db, id=product_id)
    if product is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail="Producto no encontrado")
    image = ProductImage(product_id=product_id, **image_in.model_dump())
    db.add(image)
    db.commit()
    db.refresh(image)
    return image


@router.delete(
    "/{product_id}/images/{image_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    dependencies=[Depends(get_current_active_superuser)],
)
def delete_product_image(product_id: int, image_id: int, db: Session = Depends(get_db)) -> None:
    image = db.get(ProductImage, image_id)
    if image is None or image.product_id != product_id:
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail="Imagen no encontrada")
    db.delete(image)
    db.commit()
