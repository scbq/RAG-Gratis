from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import rag_gratis  # Importamos todo el módulo para acceder a sus funciones y rutas
from routers.auth import router as auth_router  # 👈 importa tu router de auth

app = FastAPI()

# 👉 Importa los endpoints
app.include_router(auth_router)  # 👈 agrega esta línea

# Configurar CORS (si aún no está configurado)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # en producción deberías restringirlo
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 📌 Endpoint de prueba para verificar que el backend está funcionando
@app.get("/")
def home():
    return {"message": "🚀 API de RAG en ejecución"}

# 📌 Incluir los endpoints de `rag_gratis.py`
app.include_router(rag_gratis.router)  # Esto incluirá todos los endpoints de `rag_gratis.py`
