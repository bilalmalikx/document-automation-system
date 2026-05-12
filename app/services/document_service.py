from sqlalchemy.orm import Session
from uuid import uuid4
from app.models.template import Template
from app.models.document import GeneratedDocument
from app.services.docx_renderer import DocxRenderer
from app.config import settings

class DocumentService:
    def __init__(self, db: Session):
        self.db = db
        self.renderer = DocxRenderer(settings.TEMPLATE_DOCX_DIR, settings.OUTPUT_DOCX_DIR)
    
    def generate_document(self, template_id, field_data):
        template = self.db.query(Template).filter(Template.id == template_id).first()
        if not template:
            raise Exception("Template not found")
        
        template_filename = template.docx_template_path.split('/')[-1]
        result = self.renderer.render(template_filename, field_data)
        
        doc_record = GeneratedDocument(
            id=uuid4(),
            template_id=template_id,
            field_values=field_data,
            output_docx_path=result['path']
        )
        self.db.add(doc_record)
        self.db.commit()
        
        return {
            "document_id": doc_record.id,
            "docx_url": result['url']
        }