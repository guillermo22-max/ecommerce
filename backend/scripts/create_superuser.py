"""Create (or promote) the first superuser defined in .env."""

from app.core.config import settings
from app.crud.user import user as crud_user
from app.db.session import SessionLocal
from app.schemas.user import UserCreate


def main() -> None:
    db = SessionLocal()
    try:
        existing = crud_user.get_by_email(db, email=settings.FIRST_SUPERUSER_EMAIL)
        if existing is not None:
            existing.is_superuser = True
            db.add(existing)
            db.commit()
            print(f"Usuario existente '{existing.email}' promovido a superusuario.")
            return

        user_in = UserCreate(
            email=settings.FIRST_SUPERUSER_EMAIL,
            password=settings.FIRST_SUPERUSER_PASSWORD,
            full_name="Superadmin",
        )
        user = crud_user.create(db, obj_in=user_in)
        user.is_superuser = True
        db.add(user)
        db.commit()
        print(f"Superusuario creado: {user.email}")
    finally:
        db.close()


if __name__ == "__main__":
    main()
