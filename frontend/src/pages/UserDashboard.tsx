import { useEffect, useState } from "react";
import axios from "axios";
import { LogOut, ChevronLeft, ChevronRight } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

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
        { pregunta: input }, // 👈 el backend espera "pregunta"
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
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      {/* Header */}
      <div className="w-full max-w-3xl flex justify-between items-center mb-6">
        <h1 className="text-xl font-bold text-gray-700">💬 BEI Chat</h1>
        <button
          onClick={handleLogout}
          className="text-red-500 hover:underline flex items-center gap-1"
        >
          <LogOut size={18} /> Cerrar sesión
        </button>
      </div>

      {/* Chat Input */}
      <div className="w-full max-w-3xl bg-white p-4 rounded-lg shadow space-y-4">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Escribe tu pregunta..."
            className="flex-1 border rounded-md p-2 text-sm"
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm disabled:opacity-50"
          >
            {loading ? "Enviando..." : "Enviar"}
          </button>
        </form>

        {/* Historial */}
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {historialPaginado.map((item) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="p-3 border rounded-md bg-gray-50"
            >
              <p className="text-gray-800 text-sm font-semibold">
                ❓ {item.pregunta}
              </p>
              <p className="text-gray-600 text-sm mt-1">💡 {item.respuesta}</p>
            </motion.div>
          ))}
        </div>

        {/* Paginación */}
        {totalPaginas > 1 && (
          <div className="flex justify-center gap-2 mt-4">
            <button
              onClick={() => setPagina((prev) => Math.max(prev - 1, 1))}
              disabled={pagina === 1}
              className="px-3 py-1 bg-gray-300 rounded-md text-sm disabled:opacity-50"
            >
              <ChevronLeft size={16} /> Anterior
            </button>
            <span className="text-sm">
              Página {pagina} de {totalPaginas}
            </span>
            <button
              onClick={() =>
                setPagina((prev) =>
                  prev * preguntasPorPagina < historial.length ? prev + 1 : prev
                )
              }
              disabled={pagina * preguntasPorPagina >= historial.length}
              className="px-3 py-1 bg-gray-300 rounded-md text-sm disabled:opacity-50"
            >
              Siguiente <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserDashboard;
