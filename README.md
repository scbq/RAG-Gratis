instalar OLLAMA
PASO 1:
Clonar proyecto desde:
https://github.com/scbq/RAG-Gratis.git
 
PASO 2:
Crear y activar entorno virtual en carpeta backend
WINDOWS
py -m venv .venv
./.venv/Scripts/activate
 
MAC
Crear y activar entorno virtual en la carpeta backend
python3 -m venv .venv
source .venv/bin/activate
 
PASO 3
Instalar dependencias desde la carpeta BACKEND
comando para instalar todas las dependencias guardadas en el archivo txt
pip install -r requirements.txt
 
PASO 4
comando para correr en carpeta frontend
npm install
 
PASO 5
Hacer correr el servidor (carpeta backend)
uvicorn main:app --reload
 
PASO 6
Hacer correr el frontend
npm run dev
 
NOTA IMPORTANTE:
SE DEBE CREAR UNA BD Y DESPUES ESPECIFICARLA EN EL ARCHIVO .ENV PARA HACER PERSISTENCIA DE USUARIOS
