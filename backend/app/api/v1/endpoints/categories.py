from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_active_superuser, get_db
from app.crud.category import category as crud_category
from app.schemas.category import CategoryCreate, CategoryRead, CategoryUpdate

router = APIRouter()


@router.get("/", response_model=list[CategoryRead])
def list_categories(
    skip: int = 0, limit: int = 100, db: Session = Depends(get_db)
) -> list[CategoryRead]:
    return crud_category.get_multi(db, skip=skip, limit=limit)


@router.get("/{category_id}", response_model=CategoryRead)
def get_category(category_id: int, db: Session = Depends(get_db)) -> CategoryRead:
    category = crud_category.get(db, id=category_id)
    if category is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail="Categoría no encontrada")
    return category


@router.post(
    "/",
    response_model=CategoryRead,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(get_current_active_superuser)],
)
def create_category(category_in: CategoryCreate, db: Session = Depends(get_db)) -> CategoryRead:
    if crud_category.get_by_slug(db, slug=category_in.slug) is not None:
        raise HTTPException(
            status.HTTP_400_BAD_REQUEST, detail="Ya existe una categoría con ese slug"
        )
    return crud_category.create(db, obj_in=category_in)


@router.patch(
    "/{category_id}",
    response_model=CategoryRead,
    dependencies=[Depends(get_current_active_superuser)],
)
def update_category(
    category_id: int, category_in: CategoryUpdate, db: Session = Depends(get_db)
) -> CategoryRead:
    category = crud_category.get(db, id=category_id)
    if category is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail="Categoría no encontrada")
    if category_in.slug and category_in.slug != category.slug:
        existing = crud_category.get_by_slug(db, slug=category_in.slug)
        if existing is not None and existing.id != category_id:
            raise HTTPException(
                status.HTTP_400_BAD_REQUEST, detail="Ya existe una categoría con ese slug"
            )
    return crud_category.update(db, db_obj=category, obj_in=category_in)


@router.delete(
    "/{category_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    dependencies=[Depends(get_current_active_superuser)],
)
def delete_category(category_id: int, db: Session = Depends(get_db)) -> None:
    if crud_category.get(db, id=category_id) is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail="Categoría no encontrada")
    crud_category.remove(db, id=category_id)
