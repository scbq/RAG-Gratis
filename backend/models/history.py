from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from database import Base

class History(Base):
    __tablename__ = "history"

    id = Column(Integer, primary_key=True, index=True)
    pregunta = Column(String, nullable=False)
    respuesta = Column(String, nullable=False)
    fecha = Column(DateTime, default=datetime.utcnow)

    user_rut = Column(String, ForeignKey("users.rut"))
    user = relationship("User", back_populates="historial")
