from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models.history import History
from models.user import User
from schemas.history import HistoryCreate, HistoryOut
from routers.auth import get_current_user

router = APIRouter()

@router.post("/historial", response_model=HistoryOut)
def guardar_historial(data: HistoryCreate, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    historial = History(pregunta=data.pregunta, respuesta=data.respuesta, user_rut=user.rut)
    db.add(historial)
    db.commit()
    db.refresh(historial)
    return historial

@router.get("/historial", response_model=list[HistoryOut])
def obtener_historial(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    return db.query(History).filter(History.user_rut == user.rut).order_by(History.timestamp.desc()).all()
