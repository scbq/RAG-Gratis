from pydantic import BaseModel, EmailStr

class UserCreate(BaseModel):
    rut: str
    nombre: str
    apellido: str
    email: EmailStr
    password: str
    role: str

class UserUpdate(BaseModel):
    nombre: str
    apellido: str
    email: EmailStr
    role: str

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

class Token(BaseModel):
    access_token: str
    token_type: str
