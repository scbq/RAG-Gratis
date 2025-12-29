import { useEffect, useState } from "react";
import axios from "axios";
import { Trash2, ArrowLeftCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const DeleteFiles = () => {
  const [archivos, setArchivos] = useState<string[]>([]);
  const [mensaje, setMensaje] = useState("");
  const navigate = useNavigate();
  const { logout } = useAuth();

  const obtenerArchivos = async () => {
    try {
      const response = await axios.get("http://127.0.0.1:8000/files");
      setArchivos(response.data.archivos);
    } catch (error) {
      console.error("Error al listar archivos:", error);
    }
  };

  useEffect(() => {
    obtenerArchivos();
  }, []);

  const eliminarArchivo = async (nombre: string) => {
    try {
      await axios.delete(`http://127.0.0.1:8000/files/${nombre}`);
      setMensaje(`✅ Archivo eliminado: ${nombre}`);
      setArchivos((prev) => prev.filter((a) => a !== nombre));
    } catch (error) {
      console.error("Error al eliminar archivo:", error);
      setMensaje("❌ Error al eliminar archivo.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold">🗑️ Eliminar Archivos</h1>
          <div className="flex gap-4 items-center">
            <button
              onClick={() => navigate("/admin")}
              className="text-blue-600 hover:text-blue-800 flex items-center"
            >
              <ArrowLeftCircle className="mr-1" />
              Volver
            </button>
            <button
              onClick={() => {
                logout();
                navigate("/");
              }}
              className="text-sm text-red-600 hover:underline"
            >
              Cerrar sesión
            </button>
          </div>
        </div>

        {mensaje && (
          <div className="mb-4 text-sm text-center text-green-600 font-semibold">
            {mensaje}
          </div>
        )}

        <ul className="space-y-3">
          {archivos.length === 0 ? (
            <p className="text-gray-500">No hay archivos cargados.</p>
          ) : (
            archivos.map((nombre) => (
              <li
                key={nombre}
                className="flex justify-between items-center border rounded-md p-3 shadow-sm"
              >
                <span className="text-sm text-gray-700">{nombre}</span>
                <button
                  onClick={() => eliminarArchivo(nombre)}
                  className="text-red-500 hover:text-red-700"
                >
                  <Trash2 />
                </button>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
};

export default DeleteFiles;
