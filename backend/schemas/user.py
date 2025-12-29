from pydantic import BaseModel, EmailStr


# 👉 Esquema para crear usuarios
class UserCreate(BaseModel):
    rut: str
    nombre: str
    apellido: str
    email: EmailStr
    password: str
    role: str  # "user" o "admin"


# 👉 Esquema para actualizar usuarios (sin contraseña ni RUT)
class UserUpdate(BaseModel):
    nombre: str
    apellido: str
    email: EmailStr
    role: str


# 👉 Esquema para respuesta al frontend
class UserOut(BaseModel):
    rut: str
    nombre: str
    apellido: str
    email: EmailStr
    role: str

    class Config:
        orm_mode = True


class UserResetPassword(BaseModel):
    nueva_password: str



# 👉 Esquema para el token de autenticación
class Token(BaseModel):
    access_token: str
    token_type: str
