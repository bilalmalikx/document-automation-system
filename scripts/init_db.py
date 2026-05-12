import sys
from pathlib import Path

sys.path.append(str(Path(__file__).parent.parent))

from app.database.session import engine, Base
from app.models import Template, TemplateField, GeneratedDocument

def init_db():
    print("Creating database tables...")
    Base.metadata.create_all(bind=engine)
    print("Database initialized successfully!")

if __name__ == "__main__":
    init_db()