from fastapi import FastAPI, File, UploadFile
from pydantic import BaseModel

app = FastAPI()

# Prueba de subida de archivo
@app.post("/upload_test")
async def upload_file(file: UploadFile = File(...)):
    return {"filename": file.filename}

# Prueba de pregunta simple
class PreguntaRequest(BaseModel):
    pregunta: str

@app.post("/preguntar_test")
def preguntar_test(pregunta_request: PreguntaRequest):
    return {"respuesta": f"Recibí la pregunta: {pregunta_request.pregunta}"}

@app.get("/")
def home():
    return {"mensaje": "API de prueba funcionando"}
