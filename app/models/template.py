from sqlalchemy import Column, String, Text, DateTime, Boolean
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from app.database.session import Base
import uuid

class Template(Base):
    __tablename__ = "templates"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(200), nullable=False)
    description = Column(Text)
    docx_template_path = Column(String(500))
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())