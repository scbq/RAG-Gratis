from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import rag_gratis  # Importamos todo el módulo para acceder a sus funciones y rutas

app = FastAPI()

# 📌 Configurar CORS para permitir peticiones desde el frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Puedes restringirlo en producción
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
