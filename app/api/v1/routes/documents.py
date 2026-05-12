from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from uuid import UUID, uuid4
from typing import Dict, Any

from app.database.session import get_db
from app.services.docx_renderer import DocxRenderer
from app.services.html_renderer import HTMLRenderer
from app.models.template import Template
from app.models.document import GeneratedDocument
from app.config import settings

router = APIRouter()

docx_renderer = DocxRenderer(settings.TEMPLATE_DOCX_DIR, settings.OUTPUT_DOCX_DIR)
html_renderer = HTMLRenderer(settings.TEMPLATE_HTML_DIR, settings.OUTPUT_PDF_DIR)


# ============ GENERATE DOCX FROM TEMPLATE ============
@router.post("/generate")
def generate_document(
    template_id: UUID,
    data: Dict[str, Any],
    db: Session = Depends(get_db)
):
    template = db.query(Template).filter(Template.id == template_id).first()
    if not template:
        raise HTTPException(status_code=404, detail="Template not found")
    
    if template.template_type == "docx":
        template_filename = template.docx_template_path.split('/')[-1]
        result = docx_renderer.render(template_filename, data)
        output_path_field = "output_docx_path"
        url_field = "docx_url"
    else:
        template_filename = template.html_template_path.split('/')[-1]
        with open(template.html_template_path, 'r', encoding='utf-8') as f:
            html_content = f.read()
        result = html_renderer.render_to_pdf_simple(html_content, data)
        output_path_field = "output_pdf_path"
        url_field = "pdf_url"
    
    doc_record = GeneratedDocument(
        id=uuid4(),
        template_id=template_id,
        field_values=data,
        **{output_path_field: result['path']}
    )
    db.add(doc_record)
    db.commit()
    
    return {
        "document_id": doc_record.id,
        url_field: result['url']
    }


# ============ PREVIEW (Real-time for Panel 3) ============
@router.post("/preview")
def preview_document(request: dict):
    html_content = request.get("content", "")
    data = request.get("data", {})
    
    try:
        rendered_html = html_renderer.render_to_html(html_content, data)
        return {"rendered_html": rendered_html}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Preview error: {str(e)}")