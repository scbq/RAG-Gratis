from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import rag_gratis  # Importa el módulo completo sin funciones específicas

app = FastAPI()

@app.get("/")
def home():
    return {"message": "🚀 API de RAG en ejecución"}

# Definir el esquema de entrada para FastAPI
class PreguntaRequest(BaseModel):
    mensaje: str

@app.post("/preguntar")
def preguntar(request: PreguntaRequest):
    return {"respuesta": rag_gratis.respuesta(request.mensaje)}

# Configurar CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Puedes especificar dominios en producción
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)