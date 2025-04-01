from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers.auth import router as auth_router  # Router para autenticación y usuarios
from rag_gratis import router as rag_router     # Router para funcionalidades de RAG
from routers.history import router as history_router

app = FastAPI(title="RAG-Gratis API", version="1.0")

# ✅ CORS (permite conexión desde el frontend en desarrollo)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # En producción, reemplaza con tu dominio real
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 🧠 Endpoints de autenticación y usuarios
app.include_router(auth_router)

# 📄 Endpoints del módulo RAG (carga PDF, hacer preguntas, eliminar archivos, etc.)
app.include_router(rag_router)

app.include_router(history_router)

# 🏠 Endpoint raíz
@app.get("/")
def home():
    return {"message": "🚀 API de RAG en ejecución"}
