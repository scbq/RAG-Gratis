# create_tables.py
from database import engine, Base
from models.user import User
from models.history import History

print("🛠️ Creando tablas...")
Base.metadata.create_all(bind=engine)
print("✅ Tablas creadas exitosamente.")
