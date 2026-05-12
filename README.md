# document-automation-system
# 1. Upload HTML template
curl -X POST "http://localhost:8000/api/v1/templates/upload-html" \
  -F "name=Simple Template" \
  -F "description=Test HTML template" \
  -F "file=@app/templates/html/simple_template.html"

# 2. Generate PDF
curl -X POST "http://localhost:8000/api/v1/documents/generate-pdf" \
  -H "Content-Type: application/json" \
  -d '{
    "template_id": "YOUR_TEMPLATE_ID",
    "data": {
      "title": "Test Document",
      "company_name": "Tech Solutions",
      "director_name": "Ali Raza",
      "signing_date": "2026-05-12",
      "message": "This is a test document"
    }
  }'