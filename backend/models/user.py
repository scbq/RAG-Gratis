from sqlalchemy import Column, String
from database import Base

class User(Base):
    __tablename__ = "users"

    rut = Column(String, primary_key=True, index=True)
    nombre = Column(String, nullable=False)
    apellido = Column(String, nullable=False)
    email = Column(String, unique=True, index=True)
    password = Column(String)
    role = Column(String, default="user")
