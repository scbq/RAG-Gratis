import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { LogOut, Send, Upload, ArrowLeftCircle, FileText, Loader2, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

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

  const loadFiles = async () => {
    try {
      const r = await fetch(`${API_URL}/files`, {
        headers: { Authorization: `Bearer ${token || ""}` },
      });
      if (!r.ok) throw new Error(`GET /files -> ${r.status}`);
      const data = await r.json();
      setPdfs(Array.isArray(data.archivos) ? data.archivos : Array.isArray(data) ? data : []);
    } catch (e) {
      console.warn("No se pudieron cargar los archivos:", e);
    }
  };

  useEffect(() => {
    loadFiles();
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
        headers: { Authorization: `Bearer ${token || ""}` },
      });
      if (!response.ok) throw new Error("Error al cargar");
      await loadFiles();
      e.target.value = "";
    } catch (error) {
      console.error(error);
      alert("Error al subir el documento.");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;
    setLoading(true);
    setAnswer("");

    try {
      const response = await fetch(`${API_URL}/preguntar`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token || ""}`,
        },
        body: JSON.stringify({ pregunta: question }),
      });
      const data = await response.json();
      setAnswer(data?.respuesta ?? "No tengo información suficiente.");
    } catch (error) {
      setAnswer("⚠️ Error al conectar con el servidor.");
    } finally {
      setLoading(false);
      setQuestion("");
    }
  };

  return (
    <div className="min-h-screen bg-[#0a192f] text-slate-200 relative overflow-hidden flex flex-col">
      {/* Fondo Decorativo */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-900/20 rounded-full blur-[120px]" />
      </div>

      {/* Navbar Superior */}
      <nav className="bg-white/5 backdrop-blur-md border-b border-white/10 px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/admin")}
              className="p-2 hover:bg-white/10 rounded-full transition-colors text-slate-400 hover:text-white"
            >
              <ArrowLeftCircle className="h-6 w-6" />
            </button>
            <h1 className="text-xl font-bold bg-gradient-to-r from-white to-blue-400 bg-clip-text text-transparent">
              BEI Chat Intelligence
            </h1>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-rose-400 hover:bg-rose-500/10 rounded-lg transition-all"
          >
            <LogOut className="h-4 w-4" />
            Salir
          </button>
        </div>
      </nav>

      <main className="flex-1 container mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8 overflow-hidden">
        
        {/* Columna Izquierda: Gestión de Archivos */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-xl">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Upload className="h-5 w-5 text-blue-400" />
              Base de Conocimiento
            </h2>
            
            <input
              type="file"
              accept=".pdf"
              onChange={handleFileUpload}
              className="hidden"
              id="file-upload"
              disabled={uploading}
            />
            <label
              htmlFor="file-upload"
              className={`cursor-pointer flex items-center justify-center w-full py-4 border-2 border-dashed rounded-xl transition-all ${
                uploading 
                ? "border-blue-500/50 bg-blue-500/10" 
                : "border-slate-700 hover:border-blue-500/50 hover:bg-white/5"
              }`}
            >
              {uploading ? (
                <div className="flex items-center gap-3 text-blue-400">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span className="font-medium">Procesando PDF...</span>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2 text-slate-400">
                  <Upload className="h-6 w-6" />
                  <span className="text-sm font-medium text-slate-300">Subir nuevo documento</span>
                </div>
              )}
            </label>

            <div className="mt-8">
              <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-4">
                Documentos Indexados ({pdfs.length})
              </h3>
              <div className="max-h-[300px] overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                {pdfs.length === 0 ? (
                  <p className="text-sm text-slate-500 italic">No hay archivos en la nube.</p>
                ) : (
                  pdfs.map((name) => (
                    <div key={name} className="flex items-center gap-3 p-3 bg-white/5 rounded-lg border border-white/5 hover:border-blue-500/30 transition-colors">
                      <FileText className="h-4 w-4 text-blue-400 shrink-0" />
                      <span className="text-sm text-slate-300 truncate">{name}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Columna Derecha: Chat Interface */}
        <div className="lg:col-span-8 flex flex-col bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-white/10 bg-white/5 flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-yellow-400" />
            <h2 className="font-semibold text-white">Consultas Inteligentes</h2>
          </div>

          {/* Área de Mensajes */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4 min-h-[400px]">
            {!answer && !loading ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-500 text-center space-y-4">
                <div className="p-4 bg-slate-900 rounded-full">
                  <Send className="h-8 w-8 opacity-20" />
                </div>
                <p>Haz una pregunta para empezar a analizar tus documentos.</p>
              </div>
            ) : null}

            {loading && (
              <div className="flex items-start gap-3 animate-pulse">
                <div className="bg-blue-600 h-8 w-8 rounded-lg flex items-center justify-center shrink-0">
                  <Loader2 className="h-5 w-5 animate-spin text-white" />
                </div>
                <div className="bg-white/10 rounded-2xl rounded-tl-none p-4 max-w-[80%]">
                  <div className="h-2 w-24 bg-white/20 rounded mb-2"></div>
                  <div className="h-2 w-48 bg-white/20 rounded"></div>
                </div>
              </div>
            )}

            {answer && (
              <div className="flex items-start gap-3 animate-in fade-in slide-in-from-bottom-2">
                <div className="bg-blue-600 h-8 w-8 rounded-lg flex items-center justify-center shrink-0 shadow-lg shadow-blue-500/20 text-white">
                  AI
                </div>
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl rounded-tl-none p-4 text-slate-200 shadow-sm max-w-[90%]">
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{answer}</p>
                </div>
              </div>
            )}
          </div>

          {/* Input de Chat */}
          <div className="p-6 bg-slate-900/50 border-t border-white/10">
            <form onSubmit={handleSubmit} className="relative group">
              <input
                type="text"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Escribe tu consulta aquí..."
                className="w-full bg-slate-800/50 border border-slate-700 text-white pl-4 pr-14 py-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all placeholder:text-slate-500"
                disabled={loading}
              />
              <button
                type="submit"
                disabled={loading || !question.trim()}
                className="absolute right-2 top-2 bottom-2 px-4 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 text-white rounded-lg transition-all flex items-center shadow-lg shadow-blue-500/20"
              >
                <Send className="h-5 w-5" />
              </button>
            </form>
            <p className="text-[10px] text-slate-500 mt-3 text-center uppercase tracking-widest">
              Potenciado por RAG Technology • BEI Chat v1.0
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;