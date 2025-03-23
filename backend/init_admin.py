# init_admin.py
from database import SessionLocal
from models.user import User
from passlib.context import CryptContext

db = SessionLocal()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

admin_existente = db.query(User).filter(User.email == "admin@example.com").first()

if not admin_existente:
    admin = User(
        rut="12345678-9",
        nombre="Admin",
        apellido="Principal",
        email="admin@example.com",
        password=pwd_context.hash("admin123"),
        role="admin"
    )
    db.add(admin)
    db.commit()
    print("✅ Admin creado correctamente")
else:
    print("⚠️ Ya existe un admin con ese correo")

db.close()
