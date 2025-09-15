# backend/rag_gratis.py
from __future__ import annotations
import os
import traceback
from pathlib import Path
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
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

router = APIRouter(tags=["rag"])  # SIN prefijo; si quieres /rag/* usa: prefix="/rag"

# --- rutas absolutas respecto a backend/ ---
BASE_DIR: Path = Path(__file__).resolve().parent
DATA_PATH: Path = BASE_DIR / "data"
INDEX_DIR: Path = BASE_DIR / "faiss_store"   # <<--- coincide con tu repo

EMBED_MODEL = "sentence-transformers/all-MiniLM-L6-v2"
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "qwen2.5:7b")

embedding_model = HuggingFaceEmbeddings(model_name=EMBED_MODEL)

# carga índice si existe
vectorstore: Optional[FAISS] = None
try:
    vectorstore = FAISS.load_local(
        str(INDEX_DIR),
        embeddings=embedding_model,
        allow_dangerous_deserialization=True,  # OK si el índice lo creaste tú
    )
except Exception as e:
    print(f"[FAISS] No se pudo cargar índice local, se creará uno nuevo si hay PDFs: {e}")
    vectorstore = None

def guardar_vectorstore() -> None:
    if vectorstore is not None:
        INDEX_DIR.mkdir(parents=True, exist_ok=True)
        vectorstore.save_local(str(INDEX_DIR))

# si no hay índice pero sí PDFs, auto-reindex
if vectorstore is None and DATA_PATH.exists() and any(DATA_PATH.glob("*.pdf")):
    try:
        splitter = RecursiveCharacterTextSplitter(chunk_size=500, chunk_overlap=100)
        all_splits = []
        for pdf in sorted(DATA_PATH.glob("*.pdf")):
            loader = PyPDFLoader(str(pdf))
            docs = loader.load()
            all_splits.extend(splitter.split_documents(docs))
        if all_splits:
            vectorstore = FAISS.from_documents(all_splits, embedding_model)
            guardar_vectorstore()
            print(f"[FAISS] Índice creado automáticamente desde {len(list(DATA_PATH.glob('*.pdf')))} PDFs.")
    except Exception as e:
        print("[FAISS] Error al auto-reindexar:", repr(e))
        traceback.print_exc()

# LLM
llm = ChatOllama(model=OLLAMA_MODEL, temperature=0)

system_prompt = """Eres un asistente de IA que responde con información precisa y concisa.
Usa exclusivamente la información del CONTEXTO. Si no está, responde:
"No tengo suficiente información para responder con certeza".

CONTEXTO:
{context}
"""
prompt = ChatPromptTemplate.from_messages([("system", system_prompt), ("human", "{input}")])
stuff_chain = create_stuff_documents_chain(llm, prompt)

def responder_con_rag(pregunta: str) -> str:
    if not vectorstore:
        return "⚠️ No hay documentos indexados."
    retriever = vectorstore.as_retriever(search_kwargs={"k": 3})
    rag = create_retrieval_chain(retriever, stuff_chain)
    out = rag.invoke({"input": pregunta})
    return out.get("answer") or out.get("output_text") or "No tengo suficiente información para responder con certeza."

@router.get("/status")
def status():
    n_pdfs = len(list(DATA_PATH.glob("*.pdf"))) if DATA_PATH.exists() else 0
    index_size = getattr(getattr(vectorstore, "index", None), "ntotal", 0) if vectorstore else 0
    return {
        "data_path": str(DATA_PATH),
        "index_dir": str(INDEX_DIR),
        "pdfs_en_data": n_pdfs,
        "docs_en_indice": index_size,
        "embedding_model": EMBED_MODEL,
        "ollama_model": OLLAMA_MODEL,
        "index_cargado": bool(vectorstore),
    }

@router.get("/files")
def listar_documentos():
    DATA_PATH.mkdir(parents=True, exist_ok=True)
    archivos = sorted([p.name for p in DATA_PATH.glob("*.pdf")])
    return {"archivos": archivos}

@router.post("/reindex")
def reindexar(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    DATA_PATH.mkdir(parents=True, exist_ok=True)
    pdfs = sorted(DATA_PATH.glob("*.pdf"))
    if not pdfs:
        raise HTTPException(status_code=400, detail="No hay PDFs en la carpeta data/")

    splitter = RecursiveCharacterTextSplitter(chunk_size=500, chunk_overlap=100)
    all_splits = []
    for pdf in pdfs:
        loader = PyPDFLoader(str(pdf))
        docs = loader.load()
        all_splits.extend(splitter.split_documents(docs))

    global vectorstore
    vectorstore = FAISS.from_documents(all_splits, embedding_model)
    guardar_vectorstore()

    index_size = getattr(vectorstore.index, "ntotal", 0)
    return {"mensaje": f"✅ Reindexado {len(pdfs)} PDFs en {index_size} chunks."}

@router.post("/cargar_documento")
async def cargar_documento_api(file: UploadFile = File(...)):
    try:
        if not file.filename.lower().endswith(".pdf"):
            raise HTTPException(status_code=400, detail="El archivo debe ser .pdf")

        DATA_PATH.mkdir(parents=True, exist_ok=True)
        file_path = DATA_PATH / Path(file.filename).name  # seguro

        with open(file_path, "wb") as out:
            while True:
                chunk = await file.read(1024 * 1024)
                if not chunk:
                    break
                out.write(chunk)

        loader = PyPDFLoader(str(file_path))
        docs = loader.load()
        splitter = RecursiveCharacterTextSplitter(chunk_size=500, chunk_overlap=100)
        splits = splitter.split_documents(docs)

        global vectorstore
        if vectorstore:
            vectorstore.add_documents(splits)
        else:
            vectorstore = FAISS.from_documents(splits, embedding_model)
        guardar_vectorstore()

        return {"mensaje": f"✅ '{file.filename}' cargado e indexado.", "chunks": len(splits)}
    except HTTPException:
        raise
    except Exception as e:
        print("[/cargar_documento] ERROR:", repr(e))
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"cargar_documento: {type(e).__name__}: {e}")

@router.post("/preguntar", response_model=RespuestaResponse)
def preguntar(
    body: PreguntaRequest,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    ans = responder_con_rag(body.pregunta)
    hist = History(pregunta=body.pregunta, respuesta=ans, user_rut=user.rut)
    db.add(hist)
    db.commit()
    return {"respuesta": ans}

@router.delete("/files/{nombre_archivo}")
def eliminar_documento(nombre_archivo: str):
    ruta = DATA_PATH / nombre_archivo
    if ruta.exists():
        ruta.unlink()
        return {"mensaje": f"🗑️ Documento '{nombre_archivo}' eliminado correctamente"}
    raise HTTPException(status_code=404, detail="Archivo no encontrado")
