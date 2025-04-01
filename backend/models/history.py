from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from database import Base
from datetime import datetime

class History(Base):
    __tablename__ = "histories"

    id = Column(Integer, primary_key=True, index=True)
    pregunta = Column(String, nullable=False)
    respuesta = Column(String, nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow)
    user_rut = Column(String, ForeignKey("users.rut"))

    user = relationship("User", back_populates="historial")
