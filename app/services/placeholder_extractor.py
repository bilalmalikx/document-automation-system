from docxtpl import DocxTemplate
import re
from pathlib import Path
from typing import List, Set

class PlaceholderExtractor:
    @staticmethod
    def extract_placeholders(docx_path: str) -> List[str]:
        """
        Extract all {{placeholders}} from DOCX template
        """
        doc = DocxTemplate(docx_path)
        xml = doc.get_xml()
        
        # Find all {{...}} patterns
        pattern = r'\{\{\s*([a-zA-Z_][a-zA-Z0-9_]*)\s*\}\}'
        placeholders = re.findall(pattern, xml)
        
        # Remove duplicates and return
        unique_placeholders = list(dict.fromkeys(placeholders))
        return unique_placeholders
    
    @staticmethod
    def generate_field_schema(placeholders: List[str]) -> List[dict]:
        """
        Generate field schema from placeholders
        """
        fields = []
        for placeholder in placeholders:
            # Convert snake_case to Title Case for label
            label = placeholder.replace('_', ' ').title()
            
            # Guess field type based on name
            field_type = "text"
            if "date" in placeholder.lower():
                field_type = "date"
            elif "email" in placeholder.lower():
                field_type = "email"
            elif "phone" in placeholder.lower():
                field_type = "tel"
            elif "amount" in placeholder.lower() or "price" in placeholder.lower():
                field_type = "number"
            
            fields.append({
                "placeholder_name": placeholder,
                "field_label": label,
                "field_type": field_type,
                "is_required": True,
                "display_order": len(fields) + 1
            })
        
        return fields