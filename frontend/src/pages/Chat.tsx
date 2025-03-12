import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { LogOut, Send, Upload } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Chat = () => {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [pdfs, setPdfs] = useState<File[]>([]);
  const [loading, setLoading] = useState(false); // Estado para indicar si está procesando una respuesta
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // 📂 Manejo de carga de archivos
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;

    const file = e.target.files[0];
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("http://127.0.0.1:8000/cargar_documento", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Error al cargar el documento");
      }

      const data = await response.json();
      alert(data.mensaje);
    } catch (error) {
      console.error("Error al subir el documento:", error);
      alert("Hubo un error al subir el documento.");
    }
};


  // 💬 Manejo de envío de preguntas
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!question.trim()) return;

    try {
      const response = await fetch("http://127.0.0.1:8000/preguntar", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ pregunta: question }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Error en la solicitud al backend");
      }

      const data = await response.json();
      setAnswer(data.respuesta);
    } catch (error) {
      console.error("Error al hacer la pregunta:", error);
      setAnswer("Hubo un error al obtener la respuesta.");
    }

    setQuestion("");
};


  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">RAG Chat</h1>
          <button
            onClick={handleLogout}
            className="flex items-center px-4 py-2 text-sm text-red-600 hover:text-red-800"
          >
            <LogOut className="h-5 w-5 mr-2" />
            Logout
          </button>
        </div>

        {/* Contenedor principal */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 📂 Sección de carga de PDFs */}
          <div className="lg:col-span-1 bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">📂 Subir documentos PDF</h2>
            <div className="space-y-4">
              <label className="block">
                <span className="sr-only">Seleccionar archivo PDF</span>
                <div className="relative">
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="file-upload"
                  />
                  <label
                    htmlFor="file-upload"
                    className="cursor-pointer flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                  >
                    <Upload className="h-5 w-5 mr-2" />
                    Subir PDF
                  </label>
                </div>
              </label>
              {/* 📌 Lista de archivos subidos */}
              <div className="mt-4">
                <h3 className="text-sm font-medium text-gray-700 mb-2">📑 Archivos Subidos:</h3>
                <ul className="space-y-2">
                  {pdfs.map((pdf, index) => (
                    <li key={index} className="text-sm text-gray-600">
                      {pdf.name}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* 💬 Sección de Chat */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">💬 Pregunta sobre los documentos</h2>
            <div className="h-[500px] flex flex-col">
              {/* 📌 Área de respuestas */}
              <div className="flex-1 overflow-y-auto mb-4 p-4 bg-gray-50 rounded-lg">
                {loading ? (
                  <div className="text-gray-500">⏳ Procesando...</div>
                ) : answer ? (
                  <div className="bg-white p-4 rounded-lg shadow-sm">
                    <p className="text-gray-800">{answer}</p>
                  </div>
                ) : (
                  <p className="text-gray-500">Escribe tu pregunta y presiona "Enviar".</p>
                )}
              </div>

              {/* 📌 Input y botón de enviar */}
              <form onSubmit={handleSubmit} className="flex gap-2">
                <input
                  type="text"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="Haz una pregunta sobre tus PDFs..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
                >
                  <Send className="h-5 w-5" />
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;
