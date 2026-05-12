from fastapi import APIRouter
from app.api.v1.routes import templates, documents, download

router = APIRouter()

router.include_router(templates.router, prefix="/templates", tags=["Templates"])
router.include_router(documents.router, prefix="/documents", tags=["Documents"])
router.include_router(download.router, prefix="/download", tags=["Download"])