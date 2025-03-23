from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from passlib.context import CryptContext
from datetime import datetime, timedelta
from jose import JWTError, jwt
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from database import get_db
from models.user import User
from schemas.user import UserCreate, Token, UserOut
from config import settings

SECRET_KEY = settings.SECRET_KEY
ALGORITHM = settings.ALGORITHM
ACCESS_TOKEN_EXPIRE_MINUTES = settings.ACCESS_TOKEN_EXPIRE_MINUTES

router = APIRouter()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/login")

# 🔐 Hashear contraseña
def get_password_hash(password: str):
    return pwd_context.hash(password)

# 🔍 Verificar contraseña
def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

# 🔎 Obtener usuario por email
def get_user_by_email(db: Session, email: str):
    return db.query(User).filter(User.email == email).first()

# 🔎 Obtener usuario por rut
def get_user_by_rut(db: Session, rut: str):
    return db.query(User).filter(User.rut == rut).first()

# ✅ Crear token JWT
def create_access_token(data: dict, expires_delta: timedelta | None = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=15))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

# 🧪 Obtener usuario actual a partir del token
def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="No se pudo validar las credenciales.",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if not email:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    user = get_user_by_email(db, email=email)
    if not user:
        raise credentials_exception
    return user

# ✅ Verificar si el usuario es administrador
def verificar_admin(user: User = Depends(get_current_user)):
    if user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tienes permisos de administrador."
        )
    return user

# 📝 Registro de administrador
@router.post("/registro_admin")
def registrar_admin(user: UserCreate, db: Session = Depends(get_db)):
    if get_user_by_rut(db, user.rut) or get_user_by_email(db, user.email):
        raise HTTPException(status_code=400, detail="El RUT o el correo ya están registrados.")

    hashed_password = get_password_hash(user.password)
    nuevo_usuario = User(
        rut=user.rut,
        nombre=user.nombre,
        apellido=user.apellido,
        email=user.email,
        password=hashed_password,
        role=user.role
    )
    db.add(nuevo_usuario)
    db.commit()
    db.refresh(nuevo_usuario)
    return {"mensaje": "✅ Administrador creado exitosamente"}

# 🔐 Login y emisión de token
@router.post("/login", response_model=Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = get_user_by_email(db, form_data.username)
    if not user or not verify_password(form_data.password, user.password):
        raise HTTPException(status_code=401, detail="Credenciales inválidas.")

    access_token = create_access_token(data={"sub": user.email, "role": user.role})
    return {"access_token": access_token, "token_type": "bearer"}

# ✅ Registro de usuario (con cualquier rol)
@router.post("/registro_usuario")
def registrar_usuario(user: UserCreate, db: Session = Depends(get_db)):
    if get_user_by_rut(db, user.rut) or get_user_by_email(db, user.email):
        raise HTTPException(status_code=400, detail="El RUT o el correo ya están registrados.")

    hashed_password = get_password_hash(user.password)
    nuevo_usuario = User(
        rut=user.rut,
        nombre=user.nombre,
        apellido=user.apellido,
        email=user.email,
        password=hashed_password,
        role=user.role
    )
    db.add(nuevo_usuario)
    db.commit()
    db.refresh(nuevo_usuario)
    return {"mensaje": "✅ Usuario registrado exitosamente"}

# 🔄 Endpoint de prueba para admin
@router.get("/solo_admins")
def solo_para_admins(user: User = Depends(verificar_admin)):
    return {"mensaje": f"Hola {user.email}, eres administrador ✅"}

# 📋 Obtener todos los usuarios
@router.get("/usuarios", response_model=list[UserOut])
def obtener_usuarios(db: Session = Depends(get_db), user: User = Depends(verificar_admin)):
    return db.query(User).all()

# 🔄 Cambiar contraseña por RUT
@router.put("/usuarios/{rut}/cambiar_password")
def cambiar_password(rut: str, nueva_password: str, db: Session = Depends(get_db), user: User = Depends(verificar_admin)):
    usuario = get_user_by_rut(db, rut)
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    usuario.password = get_password_hash(nueva_password)
    db.commit()
    return {"mensaje": "✅ Contraseña actualizada correctamente."}
