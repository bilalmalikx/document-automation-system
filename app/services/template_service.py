from sqlalchemy.orm import Session
from app.models.template import Template
from app.models.template_field import TemplateField

class TemplateService:
    def __init__(self, db: Session):
        self.db = db
    
    def get_template_schema(self, template_id):
        template = self.db.query(Template).filter(Template.id == template_id).first()
        if not template:
            return None
        
        fields = self.db.query(TemplateField).filter(
            TemplateField.template_id == template_id
        ).order_by(TemplateField.display_order).all()
        
        return {
            "template_id": template.id,
            "template_name": template.name,
            "fields": [
                {
                    "name": f.placeholder_name,
                    "label": f.field_label,
                    "type": f.field_type,
                    "required": f.is_required
                }
                for f in fields
            ]
        }