from jinja2 import Template
from pathlib import Path
from typing import Dict, Any
import uuid
from datetime import datetime
import tempfile
import subprocess

class HTMLRenderer:
    def __init__(self, template_dir: str, output_dir: str):
        self.template_dir = Path(template_dir)
        self.output_dir = Path(output_dir)
        self.output_dir.mkdir(parents=True, exist_ok=True)
    
    def render_to_html(self, html_content: str, context: Dict[str, Any]) -> str:
        """Render HTML string with context data"""
        template = Template(html_content)
        return template.render(**context)
    
    def render_to_pdf_simple(self, html_content: str, context: Dict[str, Any]) -> Dict[str, Any]:
        """Render HTML to PDF using simple method"""
        try:
            from weasyprint import HTML
            rendered_html = self.render_to_html(html_content, context)
            
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            unique_id = str(uuid.uuid4())[:8]
            output_filename = f"pdf_{timestamp}_{unique_id}.pdf"
            output_path = self.output_dir / output_filename
            
            HTML(string=rendered_html).write_pdf(output_path)
            
            return {
                "filename": output_filename,
                "path": str(output_path),
                "url": f"/api/v1/download/pdf/{output_filename}"
            }
        except Exception as e:
            # Fallback: save as HTML file
            return self.render_to_html_file(html_content, context)
    
    def render_to_html_file(self, html_content: str, context: Dict[str, Any]) -> Dict[str, Any]:
        """Save rendered HTML as HTML file"""
        rendered_html = self.render_to_html(html_content, context)
        
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        unique_id = str(uuid.uuid4())[:8]
        output_filename = f"html_{timestamp}_{unique_id}.html"
        output_path = self.output_dir / output_filename
        
        with open(output_path, 'w', encoding='utf-8') as f:
            f.write(rendered_html)
        
        return {
            "filename": output_filename,
            "path": str(output_path),
            "url": f"/api/v1/download/html/{output_filename}"
        }