from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from uuid import UUID, uuid4
from pathlib import Path
import shutil
import re
from datetime import datetime

from app.database.session import get_db
from app.models.template import Template
from app.models.template_field import TemplateField
from app.config import settings

router = APIRouter()


# ============ GET ALL TEMPLATES ============
@router.get("/")
def list_templates(db: Session = Depends(get_db)):
    templates = db.query(Template).filter(Template.is_active == True).all()
    return [
        {
            "id": str(t.id),
            "name": t.name,
            "description": t.description,
            "template_type": t.template_type
        }
        for t in templates
    ]


# ============ GET TEMPLATE SCHEMA (for form) ============
@router.get("/{template_id}/schema")
def get_template_schema(template_id: UUID, db: Session = Depends(get_db)):
    fields = db.query(TemplateField).filter(
        TemplateField.template_id == template_id
    ).order_by(TemplateField.display_order).all()
    
    template = db.query(Template).filter(Template.id == template_id).first()
    if not template:
        raise HTTPException(status_code=404, detail="Template not found")
    
    return {
        "template_id": template_id,
        "template_name": template.name,
        "fields": [
            {
                "name": f.placeholder_name,
                "label": f.field_label,
                "type": f.field_type,
                "required": f.is_required,
                "options": f.options
            }
            for f in fields
        ]
    }


# ============ GET TEMPLATE CONTENT (for Panel 1 & 2) ============
@router.get("/{template_id}/content")
def get_template_content(template_id: UUID, db: Session = Depends(get_db)):
    template = db.query(Template).filter(Template.id == template_id).first()
    if not template:
        raise HTTPException(status_code=404, detail="Template not found")
    
    content = ""
    
    if template.template_type == "html" and template.html_template_path:
        file_path = Path(template.html_template_path)
        if file_path.exists():
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
    
    elif template.template_type == "docx" and template.docx_template_path:
        file_path = Path(template.docx_template_path)
        if file_path.exists():
            try:
                from docx import Document
                doc = Document(file_path)
                
                # Extract full text from DOCX
                full_text = []
                
                # Get all paragraphs
                for para in doc.paragraphs:
                    if para.text.strip():
                        full_text.append(para.text)
                
                # Get text from tables
                for table in doc.tables:
                    for row in table.rows:
                        row_text = []
                        for cell in row.cells:
                            cell_text = ' '.join([p.text for p in cell.paragraphs if p.text.strip()])
                            if cell_text:
                                row_text.append(cell_text)
                        if row_text:
                            full_text.append(' | '.join(row_text))
                
                content = '\n\n'.join(full_text)
                
                # If no text found, show placeholders from database
                if not content or len(content.strip()) < 10:
                    fields = db.query(TemplateField).filter(
                        TemplateField.template_id == template_id
                    ).order_by(TemplateField.display_order).all()
                    
                    if fields:
                        content = f"📄 {template.name}\n\n"
                        content += "This DOCX template contains the following placeholders:\n\n"
                        for field in fields:
                            content += f"  • {{{{ {field.placeholder_name} }}}} : {field.field_label}\n"
                        content += "\n✅ Click 'Generate Document' to fill these values."
                    else:
                        content = f"DOCX Template: {template.name}\n\nNo placeholders detected."
                        
            except Exception as e:
                print(f"Error reading DOCX: {e}")
                content = f"DOCX Template: {template.name}\n\nError reading file. Please re-upload."
    
    return {
        "template_id": template_id,
        "name": template.name,
        "template_type": template.template_type,
        "content": content
    }


@router.get("/{template_id}/content")
def get_template_content(template_id: UUID, db: Session = Depends(get_db)):
    template = db.query(Template).filter(Template.id == template_id).first()
    if not template:
        raise HTTPException(status_code=404, detail="Template not found")
    
    content = ""
    
    if template.template_type == "html" and template.html_template_path:
        file_path = Path(template.html_template_path)
        if file_path.exists():
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
    
    elif template.template_type == "docx" and template.docx_template_path:
        file_path = Path(template.docx_template_path)
        if file_path.exists():
            try:
                from app.services.docx_to_html import DocxToHtmlConverter
                # Convert DOCX to HTML/CSS
                content = DocxToHtmlConverter.convert(file_path)
            except Exception as e:
                print(f"Error converting DOCX to HTML: {e}")
                content = f"<p>Error loading template: {str(e)}</p>"
    
    return {
        "template_id": template_id,
        "name": template.name,
        "template_type": template.template_type,
        "content": content
    }


# ============ UPLOAD DOCX TEMPLATE ============
@router.post("/upload")
async def upload_template(
    name: str = Form(...),
    description: str = Form(None),
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    if not file.filename.endswith('.docx'):
        raise HTTPException(status_code=400, detail="Only .docx files are allowed")
    
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    unique_filename = f"{timestamp}_{file.filename}"
    template_path = Path(settings.TEMPLATE_DOCX_DIR) / unique_filename
    template_path.parent.mkdir(parents=True, exist_ok=True)
    
    # Save file
    with open(template_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    # Extract placeholders
    placeholders = []
    try:
        from docx import Document
        doc = Document(template_path)
        
        # Extract text from all paragraphs
        full_text = []
        for para in doc.paragraphs:
            if para.text.strip():
                full_text.append(para.text)
        
        # Extract text from tables
        for table in doc.tables:
            for row in table.rows:
                for cell in row.cells:
                    for para in cell.paragraphs:
                        if para.text.strip():
                            full_text.append(para.text)
        
        full_text_str = ' '.join(full_text)
        
        # Find all placeholders {{anything}}
        matches = re.findall(r'\{\{\s*([a-zA-Z_][a-zA-Z0-9_]*)\s*\}\}', full_text_str)
        placeholders = list(dict.fromkeys(matches))
        
        print(f"✅ Found {len(placeholders)} placeholders: {placeholders}")
        
    except Exception as e:
        print(f"Error extracting placeholders: {e}")
        placeholders = []
    
    # Create template record
    template = Template(
        id=uuid4(),
        name=name,
        description=description,
        docx_template_path=f"app/templates/docx/{unique_filename}",
        template_type="docx",
        is_active=True
    )
    db.add(template)
    db.flush()
    
    # Delete old fields if any
    db.query(TemplateField).filter(TemplateField.template_id == template.id).delete()
    
    # Create template fields
    for idx, placeholder in enumerate(placeholders):
        label = placeholder.replace('_', ' ').title()
        
        # Guess field type
        field_type = "text"
        if "date" in placeholder.lower():
            field_type = "date"
        elif "email" in placeholder.lower():
            field_type = "email"
        elif "phone" in placeholder.lower():
            field_type = "tel"
        
        template_field = TemplateField(
            id=uuid4(),
            template_id=template.id,
            placeholder_name=placeholder,
            field_label=label,
            field_type=field_type,
            is_required=True,
            display_order=idx + 1
        )
        db.add(template_field)
    
    db.commit()
    
    return {
        "template_id": template.id,
        "name": name,
        "template_type": "docx",
        "fields_found": placeholders,
        "message": f"DOCX template uploaded successfully. Found {len(placeholders)} placeholders."
    }


# ============ UPLOAD HTML TEMPLATE ============
@router.post("/upload-html")
async def upload_html_template(
    name: str = Form(...),
    description: str = Form(None),
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    if not file.filename.endswith('.html'):
        raise HTTPException(status_code=400, detail="Only .html files are allowed")
    
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    unique_filename = f"{timestamp}_{file.filename}"
    template_path = Path(settings.TEMPLATE_HTML_DIR) / unique_filename
    template_path.parent.mkdir(parents=True, exist_ok=True)
    
    with open(template_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    with open(template_path, 'r', encoding='utf-8') as f:
        html_content = f.read()
    
    placeholders = re.findall(r'\{\{\s*([a-zA-Z_][a-zA-Z0-9_]*)\s*\}\}', html_content)
    unique_placeholders = list(dict.fromkeys(placeholders))
    
    template = Template(
        id=uuid4(),
        name=name,
        description=description,
        html_template_path=f"app/templates/html/{unique_filename}",
        template_type="html",
        is_active=True
    )
    db.add(template)
    db.flush()
    
    for idx, placeholder in enumerate(unique_placeholders):
        label = placeholder.replace('_', ' ').title()
        field_type = "text"
        if "date" in placeholder.lower():
            field_type = "date"
        elif "email" in placeholder.lower():
            field_type = "email"
        
        template_field = TemplateField(
            id=uuid4(),
            template_id=template.id,
            placeholder_name=placeholder,
            field_label=label,
            field_type=field_type,
            is_required=True,
            display_order=idx + 1
        )
        db.add(template_field)
    
    db.commit()
    
    return {
        "template_id": template.id,
        "name": name,
        "template_type": "html",
        "fields_found": unique_placeholders,
        "message": f"HTML template uploaded successfully. Found {len(unique_placeholders)} placeholders."
    }