from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.services.document_service import DocumentService
from app.schemas.document_schema import DocumentGenerateRequest, DocumentGenerateResponse

router = APIRouter()

@router.post("/generate", response_model=DocumentGenerateResponse)
def generate_document(request: DocumentGenerateRequest, db: Session = Depends(get_db)):
    service = DocumentService(db)
    try:
        result = service.generate_document(request.template_id, request.data)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))