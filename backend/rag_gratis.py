from fastapi import APIRouter, HTTPException, Depends, UploadFile, File
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from database import get_db
from models.history import History
from models.user import User
from routers.auth import get_current_user
from schemas.pregunta import PreguntaRequest, RespuestaResponse
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_community.vectorstores import FAISS
from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_ollama import ChatOllama
from langchain.chains import create_retrieval_chain
from langchain.chains.combine_documents import create_stuff_documents_chain
from langchain_core.prompts import ChatPromptTemplate
import os
import pickle

router = APIRouter()

DATA_PATH = "./data"
VECTORSTORE_PATH = "faiss_index.pkl"

embedding_model = HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")

if os.path.exists(VECTORSTORE_PATH):
    with open(VECTORSTORE_PATH, "rb") as f:
        vectorstore = pickle.load(f)
else:
    vectorstore = None

def guardar_vectorstore():
    with open(VECTORSTORE_PATH, "wb") as f:
        pickle.dump(vectorstore, f)

llm = ChatOllama(model="mistral", temperature=0)

prompt_template = """Eres un asistente de IA especializado en responder preguntas con información precisa y concisa.
Solo usa la información relevante del contexto proporcionado para responder.
Si no encuentras la respuesta en el contexto, di 'No tengo suficiente información para responder con certeza'. 

Contexto: {context}
Pregunta: {input}
"""

def respuesta(pregunta: str):
    if not vectorstore:
        return "⚠️ No hay documentos indexados en la base de datos."

    retriever = vectorstore.as_retriever(search_kwargs={"k": 3})
    retrieved_docs = retriever.invoke(pregunta)

    if not retrieved_docs:
        return "No se encontraron documentos relevantes para responder la pregunta."

    context = "\n\n".join([doc.page_content for doc in retrieved_docs])

    chain = create_stuff_documents_chain(
        llm,
        ChatPromptTemplate.from_messages([("system", prompt_template), ("human", "{input}")])
    )

    rag = create_retrieval_chain(retriever, chain)
    results = rag.invoke({"input": pregunta, "context": context})

    return results.get("answer", "No tengo suficiente información para responder con certeza.")

@router.post("/preguntar", response_model=RespuestaResponse)
def preguntar(
    pregunta_request: PreguntaRequest,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    try:
        respuesta_obtenida = respuesta(pregunta_request.pregunta)

        # Guardar en historial
        historial = History(
            pregunta=pregunta_request.pregunta,
            respuesta=respuesta_obtenida,
            user_rut=user.rut
        )
        db.add(historial)
        db.commit()

        return {"respuesta": respuesta_obtenida}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/cargar_documento")
async def cargar_documento_api(file: UploadFile = File(...)):
    try:
        file_path = os.path.join(DATA_PATH, file.filename)
        os.makedirs(DATA_PATH, exist_ok=True)
        with open(file_path, "wb") as f:
            f.write(await file.read())

        loader = PyPDFLoader(file_path)
        docs = loader.load()
        text_splitter = RecursiveCharacterTextSplitter(chunk_size=500, chunk_overlap=100)
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

@router.get("/files")
def listar_documentos():
    try:
        archivos = os.listdir(DATA_PATH)
        return {"archivos": archivos}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/files/{nombre_archivo}")
def eliminar_documento(nombre_archivo: str):
    try:
        ruta = os.path.join(DATA_PATH, nombre_archivo)
        if os.path.exists(ruta):
            os.remove(ruta)
            return {"mensaje": f"🗑️ Documento '{nombre_archivo}' eliminado correctamente."}
        else:
            raise HTTPException(status_code=404, detail="Archivo no encontrado")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
