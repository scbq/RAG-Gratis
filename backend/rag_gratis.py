from fastapi import APIRouter, HTTPException, UploadFile, File
from pydantic import BaseModel
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_community.vectorstores import FAISS
from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
import os
import pickle

# 📌 Crear un router para definir los endpoints
router = APIRouter()

# 📌 Modelo de datos para las preguntas
class PreguntaRequest(BaseModel):
    pregunta: str

# 📌 Modelo de datos para la respuesta
class RespuestaResponse(BaseModel):
    respuesta: str

# 📂 Ruta donde se guardarán los PDFs
DATA_PATH = "./data"
VECTORSTORE_PATH = "faiss_index.pkl"

# 📌 Configurar embeddings
embedding_model = HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")

# 📌 Cargar la base de datos vectorial existente o crear una nueva
if os.path.exists(VECTORSTORE_PATH):
    with open(VECTORSTORE_PATH, "rb") as f:
        vectorstore = pickle.load(f)
else:
    vectorstore = None  # No hay documentos indexados

def guardar_vectorstore():
    with open(VECTORSTORE_PATH, "wb") as f:
        pickle.dump(vectorstore, f)

# 📌 Función para responder preguntas
def respuesta(pregunta: str):
    if not vectorstore:
        return "⚠️ No hay documentos indexados en la base de datos."

    retriever = vectorstore.as_retriever()
    retrieved_docs = retriever.invoke(pregunta)

    if not retrieved_docs:
        return "No se encontraron documentos relevantes para responder la pregunta."

    return retrieved_docs[0].page_content  # Devuelve el contenido más relevante

# 📌 Endpoint para hacer preguntas
@router.post("/preguntar", response_model=RespuestaResponse)
def preguntar(pregunta_request: PreguntaRequest):
    try:
        respuesta_obtenida = respuesta(pregunta_request.pregunta)
        return {"respuesta": respuesta_obtenida}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# 📌 Endpoint para cargar documentos
@router.post("/cargar_documento")
async def cargar_documento_api(file: UploadFile = File(...)):
    try:
        # Guardar el archivo en la carpeta 'data'
        file_path = os.path.join(DATA_PATH, file.filename)
        with open(file_path, "wb") as f:
            f.write(await file.read())

        # Cargar y dividir el documento
        loader = PyPDFLoader(file_path)
        docs = loader.load()
        text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
        splits = text_splitter.split_documents(docs)

        global vectorstore
        if vectorstore:
            vectorstore.add_documents(splits)
        else:
            vectorstore = FAISS.from_documents(splits, embedding_model)

        guardar_vectorstore()
        return {"mensaje": f"✅ Documento '{file.filename}' cargado e indexado correctamente."}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
