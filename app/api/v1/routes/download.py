from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse
from pathlib import Path
from app.config import settings

router = APIRouter()


@router.get("/docx/{filename}")
def download_docx(filename: str):
    file_path = Path(settings.OUTPUT_DOCX_DIR) / filename
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="File not found")
    
    return FileResponse(
        path=file_path,
        media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        filename=filename
    )


@router.get("/pdf/{filename}")
def download_pdf(filename: str):
    file_path = Path(settings.OUTPUT_PDF_DIR) / filename
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="File not found")
    
    return FileResponse(
        path=file_path,
        media_type="application/pdf",
        filename=filename
    )


@router.get("/html/{filename}")
def download_html(filename: str):
    file_path = Path(settings.OUTPUT_PDF_DIR) / filename
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="File not found")
    
    return FileResponse(
        path=file_path,
        media_type="text/html",
        filename=filename
    )


@router.get("/{filename}")
def download_file(filename: str):
    file_path = Path(settings.OUTPUT_DOCX_DIR) / filename
    if file_path.exists():
        return FileResponse(
            path=file_path,
            media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            filename=filename
        )
    
    file_path = Path(settings.OUTPUT_PDF_DIR) / filename
    if file_path.exists():
        return FileResponse(
            path=file_path,
            media_type="application/pdf",
            filename=filename
        )
    
    raise HTTPException(status_code=404, detail="File not found")