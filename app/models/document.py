from sqlalchemy import Column, String, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.sql import func
from app.database.session import Base
import uuid

class GeneratedDocument(Base):
    __tablename__ = "generated_documents"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    template_id = Column(UUID(as_uuid=True), ForeignKey("templates.id"))
    field_values = Column(JSONB, nullable=False)
    output_docx_path = Column(String(500))
    created_at = Column(DateTime(timezone=True), server_default=func.now())