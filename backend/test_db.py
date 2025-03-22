from database import engine, Base
from backend.models.user import User

print("Creando las tablas...")
Base.metadata.create_all(bind=engine)
print("Listo 🎉")
