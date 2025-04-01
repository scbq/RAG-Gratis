from pydantic import BaseModel
from datetime import datetime

class HistoryCreate(BaseModel):
    pregunta: str
    respuesta: str

class HistoryOut(BaseModel):
    id: int
    pregunta: str
    respuesta: str
    timestamp: datetime

    class Config:
        orm_mode = True
