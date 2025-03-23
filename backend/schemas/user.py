from pydantic import BaseModel, EmailStr, constr

class UserCreate(BaseModel):
    rut: constr(strip_whitespace=True, min_length=8, max_length=12)
    nombre: str
    apellido: str
    email: EmailStr
    password: str
    role: str  # "admin" o "user"

class UserOut(BaseModel):
    rut: str
    nombre: str
    apellido: str
    email: EmailStr
    role: str

    class Config:
        orm_mode = True

class Token(BaseModel):
    access_token: str
    token_type: str
