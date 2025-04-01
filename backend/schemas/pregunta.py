from pydantic import BaseModel

class PreguntaRequest(BaseModel):
    pregunta: str

class RespuestaResponse(BaseModel):
    respuesta: str
