import { useEffect, useState } from "react";
import axios from "axios";
import { LogOut, ChevronLeft, ChevronRight } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { motion } from "framer-motion";

const UserDashboard = () => {
  const { logout } = useAuth();
  const [input, setInput] = useState("");
  const [historial, setHistorial] = useState<{ pregunta: string; respuesta: string }[]>([]);
  const [respuesta, setRespuesta] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [pagina, setPagina] = useState(1);

  const preguntasPorPagina = 10;
  const totalPaginas = Math.ceil(historial.length / preguntasPorPagina);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        "http://localhost:8000/preguntar",
        { pregunta: input },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const nuevaRespuesta = response.data.respuesta;
      setRespuesta(nuevaRespuesta);

      setHistorial((prev) => [
        { pregunta: input, respuesta: nuevaRespuesta },
        ...prev,
      ]);
      setInput("");
      setPagina(1); // volver a la primera página para ver lo nuevo
    } catch (error) {
      console.error("Error al enviar pregunta:", error);
      setMensaje("❌ Error al obtener respuesta");
    }
  };

  const historialPaginado = historial.slice(
    (pagina - 1) * preguntasPorPagina,
    pagina * preguntasPorPagina
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6 flex flex-col items-center">
      <div className="w-full max-w-4xl bg-white rounded-lg shadow-md p-4 relative">
        <button
          onClick={logout}
          className="absolute top-4 right-4 text-red-600 hover:text-red-800 text-sm flex items-center"
        >
          <LogOut className="w-4 h-4 mr-1" />
          Cerrar sesión
        </button>
        <h1 className="text-xl font-bold mb-4">💬 Chat de Usuario</h1>

        {mensaje && (
          <div className="text-center text-red-600 font-semibold text-sm mb-2">
            {mensaje}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex gap-2 mb-4">
          <input
            type="text"
            placeholder="Escribe tu pregunta..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 border px-3 py-2 rounded-md text-sm"
            required
          />
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm"
          >
            Preguntar
          </button>
        </form>

        {/* Historial */}
        <div className="max-h-[400px] overflow-y-auto space-y-4 p-2">
          {historialPaginado.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-gray-100 rounded-lg p-3 shadow-sm"
            >
              <p className="text-sm font-semibold text-gray-700 mb-1">
                ❓ {item.pregunta}
              </p>
              <p className="text-sm text-gray-600">💬 {item.respuesta}</p>
            </motion.div>
          ))}
        </div>

        {/* Paginación */}
        {totalPaginas > 1 && (
          <div className="flex justify-center items-center mt-4 gap-4">
            <button
              onClick={() => setPagina((prev) => Math.max(prev - 1, 1))}
              disabled={pagina === 1}
              className="flex items-center bg-gray-300 hover:bg-gray-400 text-sm px-3 py-1 rounded disabled:opacity-50"
            >
              <ChevronLeft size={16} />
              Anterior
            </button>
            <span className="text-sm">
              Página {pagina} de {totalPaginas}
            </span>
            <button
              onClick={() => setPagina((prev) => Math.min(prev + 1, totalPaginas))}
              disabled={pagina === totalPaginas}
              className="flex items-center bg-gray-300 hover:bg-gray-400 text-sm px-3 py-1 rounded disabled:opacity-50"
            >
              Siguiente
              <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserDashboard;
