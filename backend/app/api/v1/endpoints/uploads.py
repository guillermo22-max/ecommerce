import uuid
from pathlib import Path

from fastapi import APIRouter, Depends, HTTPException, Request, UploadFile, status

from app.api.deps import get_current_active_superuser
from app.core.config import settings

router = APIRouter()

ALLOWED_CONTENT_TYPES = {"image/jpeg", "image/png", "image/webp", "image/gif"}
MAX_UPLOAD_SIZE = 5 * 1024 * 1024


@router.post(
    "/images",
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(get_current_active_superuser)],
)
async def upload_image(request: Request, file: UploadFile) -> dict[str, str]:
    if file.content_type not in ALLOWED_CONTENT_TYPES:
        raise HTTPException(
            status.HTTP_400_BAD_REQUEST,
            detail="Formato de imagen no soportado (usa JPG, PNG, WEBP o GIF)",
        )

    contents = await file.read()
    if len(contents) > MAX_UPLOAD_SIZE:
        raise HTTPException(
            status.HTTP_400_BAD_REQUEST, detail="La imagen no puede superar 5 MB"
        )

    extension = Path(file.filename or "").suffix.lower() or ".jpg"
    filename = f"{uuid.uuid4().hex}{extension}"

    settings.UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
    (settings.UPLOAD_DIR / filename).write_bytes(contents)

    # Build an absolute URL: the frontend is a separate static site in
    # production, so a path-only URL would resolve against its origin
    # instead of the backend's. Render's proxy terminates TLS and talks
    # to us over plain HTTP, so trust X-Forwarded-Proto for the scheme.
    scheme = request.headers.get("x-forwarded-proto", request.url.scheme)
    base_url = request.base_url.replace(scheme=scheme)
    return {"url": f"{base_url}uploads/{filename}"}
