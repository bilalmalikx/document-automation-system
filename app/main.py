from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.v1.router import router
from app.config import settings

app = FastAPI(title="DocGen System", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:4200"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router, prefix=settings.API_V1_PREFIX)

@app.get("/")
def root():
    return {"message": "DocGen System API", "version": "1.0.0"}