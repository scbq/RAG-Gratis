from fastapi import APIRouter, HTTPException, UploadFile, File
from pydantic import BaseModel
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_community.vectorstores import FAISS
from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_ollama import ChatOllama  # 🔹 Agregado para usar Mistral como LLM
from langchain.chains import create_retrieval_chain
from langchain.chains.combine_documents import create_stuff_documents_chain
from langchain_core.prompts import ChatPromptTemplate
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

# 📌 Definir el modelo de lenguaje (LLM) con Ollama (Mistral)
llm = ChatOllama(model="mistral", temperature=0)  # 🔹 Se añade el LLM correcto

# 📌 Optimización del Prompt para respuestas más precisas
prompt_template = """Eres un asistente de IA especializado en responder preguntas con información precisa y concisa.
Solo usa la información relevante del contexto proporcionado para responder.
Si no encuentras la respuesta en el contexto, di 'No tengo suficiente información para responder con certeza'. 

Contexto: {context}
Pregunta: {input}
"""

# 📌 Función para responder preguntas
def respuesta(pregunta: str):
    if not vectorstore:
        return "⚠️ No hay documentos indexados en la base de datos."

    retriever = vectorstore.as_retriever(search_kwargs={"k": 3})  # 🔹 Recupera solo 3 documentos relevantes
    retrieved_docs = retriever.invoke(pregunta)

    if not retrieved_docs:
        return "No se encontraron documentos relevantes para responder la pregunta."

    # 🔹 Obtener solo el contenido de los documentos recuperados
    context = "\n\n".join([doc.page_content for doc in retrieved_docs])

    # 🔹 Aplicar el prompt optimizado
    chain = create_stuff_documents_chain(
        llm,  # 🔹 Se usa el modelo Mistral aquí
        ChatPromptTemplate.from_messages([("system", prompt_template), ("human", "{input}")])
    )

    rag = create_retrieval_chain(retriever, chain)
    results = rag.invoke({"input": pregunta, "context": context})

    return results.get("answer", "No tengo suficiente información para responder con certeza.")

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
        os.makedirs(DATA_PATH, exist_ok=True)  # 🔹 Asegura que la carpeta 'data' exista
        with open(file_path, "wb") as f:
            f.write(await file.read())

        # Cargar y dividir el documento
        loader = PyPDFLoader(file_path)
        docs = loader.load()
        text_splitter = RecursiveCharacterTextSplitter(chunk_size=500, chunk_overlap=100)  # 🔹 Tamaño optimizado
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
