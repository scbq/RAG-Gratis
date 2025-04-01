from database import SessionLocal
from models.user import User
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

db = SessionLocal()

# Datos del administrador
admin = User(
    rut="12345678-9",
    nombre="Admin",
    apellido="Principal",
    email="admin@example.com",
    password=pwd_context.hash("admin123"),  # Cambia la contraseña si quieres
    role="admin"
)

db.add(admin)
db.commit()
db.close()

print("✅ Administrador creado exitosamente")
