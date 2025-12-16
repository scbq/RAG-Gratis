import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { LogOut, Send, Upload, ArrowLeftCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

type MsgRole = "user" | "assistant";

const AdminDashboard: React.FC = () => {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [pdfs, setPdfs] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const { logout, token } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  // Cargar lista de PDFs ya existentes
  const loadFiles = async () => {
    try {
      const r = await fetch(`${API_URL}/files`, {
        headers: {
          // Si proteges /files en el futuro, deja el token:
          Authorization: `Bearer ${token || ""}`,
        },
      });
      if (!r.ok) throw new Error(`GET /files -> ${r.status}`);
      const data = await r.json();
      if (Array.isArray(data.archivos)) {
        setPdfs(data.archivos);
      } else if (Array.isArray(data)) {
        setPdfs(data);
      }
    } catch (e) {
      console.warn("No se pudieron cargar los archivos:", e);
    }
  };

  useEffect(() => {
    loadFiles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append("file", file);

    setUploading(true);
    try {
      const response = await fetch(`${API_URL}/cargar_documento`, {
        method: "POST",
        body: formData,
        headers: {
          Authorization: `Bearer ${token || ""}`,
        },
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err?.detail || "Error al cargar el documento");
      }

      const data = await response.json();
      alert(data.mensaje || "Documento cargado.");
      // refrescar la lista desde el backend para evitar des-sincronización
      await loadFiles();
      // limpiar input file para permitir subir el mismo archivo otra vez si quisieras
      e.target.value = "";
    } catch (error) {
      console.error("Error al subir el documento:", error);
      alert("Hubo un error al subir el documento.");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;

    setLoading(true);
    setAnswer(""); // limpia la respuesta previa

    try {
      const response = await fetch(`${API_URL}/preguntar`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
          Authorization: `Bearer ${token || ""}`, // 👈 token requerido
        },
        body: JSON.stringify({ pregunta: question }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData?.detail || "Error en la solicitud al backend");
      }

      const data = await response.json();
      setAnswer(data?.respuesta ?? "No tengo suficiente información para responder con certeza.");
    } catch (error) {
      console.error("Error al hacer la pregunta:", error);
      setAnswer("⚠️ Hubo un error al obtener la respuesta.");
    } finally {
      setLoading(false);
      setQuestion("");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">RAG Admin Dashboard</h1>
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/admin")}
              className="text-blue-600 hover:text-blue-800 flex items-center"
              type="button"
            >
              <ArrowLeftCircle className="mr-1" />
              Volver
            </button>
            <button onClick={handleLogout} className="text-red-600 hover:underline" type="button">
              <LogOut className="inline w-4 h-4 mr-1" />
              Cerrar sesión
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Subir PDF */}
          <div className="lg:col-span-1 bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">📂 Subir documentos PDF</h2>

            {/* NO labels anidados */}
            <div className="mb-4">
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
                {uploading ? (
                  <span className="flex items-center">
                    <span className="animate-spin border-4 border-gray-300 border-t-blue-600 rounded-full w-4 h-4 mr-2" />
                    Subiendo...
                  </span>
                ) : (
                  <>
                    <Upload className="h-5 w-5 mr-2" />
                    Subir PDF
                  </>
                )}
              </label>
            </div>

            <div className="mt-4">
              <h3 className="text-sm font-medium text-gray-700 mb-2">📑 Archivos en el índice:</h3>
              {pdfs.length === 0 ? (
                <p className="text-sm text-gray-500">No hay archivos aún.</p>
              ) : (
                <ul className="space-y-2">
                  {pdfs.map((name) => (
                    <li key={name} className="text-sm text-gray-600">
                      {name}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Chat */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">💬 Pregunta sobre los documentos</h2>
            <div className="h-[500px] flex flex-col">
              <div className="flex-1 overflow-y-auto mb-4 p-4 bg-gray-50 rounded-lg">
                {loading ? (
                  <div className="text-gray-500 flex items-center">
                    <span className="animate-spin border-4 border-gray-300 border-t-blue-600 rounded-full w-6 h-6 mr-2" />
                    ⏳ Procesando...
                  </div>
                ) : answer ? (
                  <div className="bg-white p-4 rounded-lg shadow-sm">
                    <p className="text-gray-800 whitespace-pre-wrap">{answer}</p>
                  </div>
                ) : (
                  <p className="text-gray-500">Escribe tu pregunta y presiona "Enviar".</p>
                )}
              </div>

              <form onSubmit={handleSubmit} className="flex gap-2">
                <input
                  type="text"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="Haz una pregunta sobre tus PDFs..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  required
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center disabled:opacity-50"
                  disabled={loading}
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

export default AdminDashboard;
