import { useEffect, useState } from "react";
import axios from "axios";
import { LogOut, ChevronLeft, ChevronRight, Send, MessageCircle, Bot, User as UserIcon, Sparkles, Loader2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

interface HistoryItem {
  id: number;
  pregunta: string;
  respuesta: string;
}

const UserDashboard = () => {
  const { token, logout } = useAuth();
  const navigate = useNavigate();
  const [input, setInput] = useState("");
  const [historial, setHistorial] = useState<HistoryItem[]>([]);
  const [pagina, setPagina] = useState(1);
  const [loading, setLoading] = useState(false);

  const preguntasPorPagina = 5;
  const totalPaginas = Math.ceil(historial.length / preguntasPorPagina);

  useEffect(() => {
    obtenerHistorial();
  }, []);

  const obtenerHistorial = async () => {
    try {
      const response = await axios.get("http://localhost:8000/historial", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setHistorial(response.data);
    } catch (error) {
      console.error("Error al obtener historial:", error);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    setLoading(true);
    try {
      const response = await axios.post(
        "http://localhost:8000/preguntar",
        { pregunta: input },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const nuevaRespuesta = response.data.respuesta;
      setHistorial((prev) => [
        { id: Date.now(), pregunta: input, respuesta: nuevaRespuesta },
        ...prev,
      ]);
      setInput("");
      setPagina(1);
    } catch (error) {
      console.error("Error al enviar pregunta:", error);
    } finally {
      setLoading(false);
    }
  };

  const historialPaginado = historial.slice(
    (pagina - 1) * preguntasPorPagina,
    pagina * preguntasPorPagina
  );

  return (
    <div className="min-h-screen bg-[#0a192f] text-slate-200 flex flex-col items-center p-4 md:p-8 relative overflow-hidden">
      {/* Fondo Decorativo */}
      <div className="absolute inset-0 overflow-hidden -z-10">
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-600/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-900/20 rounded-full blur-[120px]" />
      </div>

      {/* Header Container */}
      <div className="w-full max-w-4xl flex justify-between items-center mb-8 bg-white/5 backdrop-blur-md p-4 rounded-2xl border border-white/10">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-lg shadow-lg shadow-blue-500/20">
            <MessageCircle className="text-white h-5 w-5" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-white">BEI Chat <span className="text-blue-400 font-normal text-sm ml-2">Asistente Virtual</span></h1>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-rose-400 hover:bg-rose-500/10 transition-all text-sm font-medium"
        >
          <LogOut size={18} /> <span>Salir</span>
        </button>
      </div>

      {/* Main Content */}
      <div className="w-full max-w-4xl space-y-6">
        
        {/* Input Box */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-3xl shadow-2xl">
          <form onSubmit={handleSubmit} className="relative group">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Haz una consulta sobre los documentos..."
              className="w-full bg-slate-900/50 border border-slate-700 text-white pl-5 pr-16 py-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all placeholder:text-slate-500"
              required
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="absolute right-2 top-2 bottom-2 px-5 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 disabled:text-slate-600 text-white rounded-xl transition-all flex items-center shadow-lg shadow-blue-600/20"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />}
            </button>
          </form>
        </div>

        {/* Historial Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 px-2">
            <Sparkles className="h-4 w-4 text-blue-400" />
            <h2 className="text-sm font-bold uppercase tracking-widest text-slate-400">Consultas Recientes</h2>
          </div>

          <div className="space-y-4 min-h-[400px]">
            <AnimatePresence mode="popLayout">
              {historialPaginado.length === 0 ? (
                <div className="text-center py-20 bg-white/5 rounded-3xl border border-dashed border-white/10">
                   <p className="text-slate-500 italic">No hay historial disponible. ¡Comienza a preguntar!</p>
                </div>
              ) : (
                historialPaginado.map((item) => (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="group space-y-3"
                  >
                    {/* Pregunta Usuario */}
                    <div className="flex justify-end items-start gap-3">
                      <div className="bg-blue-600/20 border border-blue-500/30 p-4 rounded-2xl rounded-tr-none max-w-[85%] shadow-sm">
                        <div className="flex items-center gap-2 mb-1">
                          <UserIcon size={12} className="text-blue-400" />
                          <span className="text-[10px] font-bold uppercase text-blue-400 tracking-tighter">Tú</span>
                        </div>
                        <p className="text-sm text-slate-200">{item.pregunta}</p>
                      </div>
                    </div>

                    {/* Respuesta IA */}
                    <div className="flex justify-start items-start gap-3">
                      <div className="bg-slate-800/50 border border-slate-700 p-5 rounded-2xl rounded-tl-none max-w-[90%] shadow-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <Bot size={14} className="text-emerald-400" />
                          <span className="text-[10px] font-bold uppercase text-emerald-400 tracking-tighter">BEI Assistant</span>
                        </div>
                        <p className="text-sm text-slate-300 leading-relaxed">{item.respuesta}</p>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Paginación Pro */}
        {totalPaginas > 1 && (
          <div className="flex justify-center items-center gap-6 pb-10">
            <button
              onClick={() => setPagina((prev) => Math.max(prev - 1, 1))}
              disabled={pagina === 1}
              className="p-2 bg-white/5 border border-white/10 rounded-full hover:bg-white/10 disabled:opacity-20 transition-all text-blue-400"
            >
              <ChevronLeft size={24} />
            </button>
            <div className="px-4 py-1.5 bg-white/5 border border-white/10 rounded-full text-xs font-medium text-slate-400">
              Página <span className="text-white">{pagina}</span> de {totalPaginas}
            </div>
            <button
              onClick={() => setPagina((prev) => (prev < totalPaginas ? prev + 1 : prev))}
              disabled={pagina === totalPaginas}
              className="p-2 bg-white/5 border border-white/10 rounded-full hover:bg-white/10 disabled:opacity-20 transition-all text-blue-400"
            >
              <ChevronRight size={24} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserDashboard;
