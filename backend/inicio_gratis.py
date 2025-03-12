import gradio as gr
import os
from rag_gratis import respuesta  # Importamos la función respuesta desde el backend
from langchain_chroma import Chroma
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter

# Configuración de la base de datos vectorial
vectorstore_path = "./vectordb_gratis"
embedding_model = HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")

# Intentar cargar la base de datos vectorial
try:
    vectorstore = Chroma(persist_directory=vectorstore_path, embedding_function=embedding_model)
except Exception as e:
    print(f"⚠️ No se pudo cargar la base de datos vectorial: {e}")
    vectorstore = None

# Función para cargar nuevos archivos PDF en la base de datos
def cargar_documento(pdf_file):
    if pdf_file is None:
        return "⚠️ No se seleccionó ningún archivo."
    
    file_name = os.path.basename(pdf_file.name)
    file_path = os.path.join("./data", file_name)  # Guardar en la carpeta correcta
    
    # Guardar el archivo en la carpeta /data
    with open(file_path, "wb") as f:
        f.write(pdf_file.read())
    
    print(f"📄 Archivo guardado: {file_path}")
    
    # Cargar y procesar el PDF
    loader = PyPDFLoader(file_path)
    docs = loader.load()
    
    # Dividir el texto en fragmentos más pequeños
    text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
    splits = text_splitter.split_documents(docs)
    
    # Indexar los documentos en la BD vectorial sin borrar los anteriores
    vectorstore.add_documents(splits)
    print(f"✅ Documento '{file_name}' indexado correctamente.")
    
    return f"✅ Documento '{file_name}' cargado e indexado correctamente."

# Configuración de la interfaz de usuario
with gr.Blocks() as interfaz:
    gr.Markdown("# 📚 Asistente Inteligente de Búsqueda en Documentos")
    
    # Sección de carga de archivos
    with gr.Row():
        file_input = gr.File(label="📂 Cargar un nuevo documento PDF", type="filepath")
        cargar_btn = gr.Button("🔄 Cargar Documento")
        output_carga = gr.Textbox(label="Estado de Carga")
    
    cargar_btn.click(cargar_documento, inputs=file_input, outputs=output_carga)
    
    # Sección de preguntas y respuestas
    chat_interface = gr.ChatInterface(respuesta, title="📚 Asistente de Documentos")

if __name__ == "__main__":
    interfaz.launch()
