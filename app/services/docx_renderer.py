from docxtpl import DocxTemplate
from pathlib import Path
from typing import Dict, Any
import uuid
from datetime import datetime

class DocxRenderer:
    def __init__(self, template_dir: str, output_dir: str):
        self.template_dir = Path(template_dir)
        self.output_dir = Path(output_dir)
        self.output_dir.mkdir(parents=True, exist_ok=True)
    
    def render(self, template_filename: str, context: Dict[str, Any]) -> Dict[str, Any]:
        template_path = self.template_dir / template_filename
        doc = DocxTemplate(template_path)
        doc.render(context)
        
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        unique_id = str(uuid.uuid4())[:8]
        output_filename = f"doc_{timestamp}_{unique_id}.docx"
        output_path = self.output_dir / output_filename
        
        doc.save(output_path)
        
        return {
            "filename": output_filename,
            "path": str(output_path),
            "url": f"/api/v1/download/{output_filename}"
        }