# Dockerfile (backend)
FROM python:3.11-slim

# Crear directorio app
WORKDIR /app

# Copiar archivos
COPY requirements.txt ./
COPY . /app

# Instalar dependencias
RUN pip install --upgrade pip
RUN pip install -r requirements.txt

# Exponer el puerto
EXPOSE 8000

# Comando para ejecutar FastAPI
CMD ["uvicorn", "rag_gratis:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
