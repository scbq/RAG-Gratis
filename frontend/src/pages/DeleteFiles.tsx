import { useEffect, useState } from "react";
import axios from "axios";
import { Trash2, ArrowLeftCircle, FileWarning, LogOut, FileText, Info } from "lucide-react";
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
      setArchivos(response.data.archivos || response.data);
    } catch (error) {
      console.error("Error al listar archivos:", error);
    }
  };

  useEffect(() => {
    obtenerArchivos();
  }, []);

  const eliminarArchivo = async (nombre: string) => {
    if (!window.confirm(`¿Estás seguro de que deseas eliminar permanentemente? "${nombre}"?`)) return;

    try {
      await axios.delete(`http://127.0.0.1:8000/files/${nombre}`);
      setMensaje(`✅ "${nombre}" ha sido eliminado.`);
      setArchivos((prev) => prev.filter((a) => a !== nombre));
      setTimeout(() => setMensaje(""), 4000);
    } catch (error) {
      console.error("Error al eliminar archivo:", error);
      setMensaje("❌ Error al intentar eliminar el archivo.");
    }
  };

  return (
    <div className="min-h-screen bg-[#0a192f] text-slate-200 relative overflow-hidden flex flex-col">
      {/* Fondo Decorativo */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
        <div className="absolute top-[-5%] right-[-5%] w-[40%] h-[40%] bg-blue-900/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-900/20 rounded-full blur-[120px]" />
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
            <div className="flex flex-col">
              {/* Título corregido con degradado azul/celeste */}
              <h1 className="text-xl font-bold bg-gradient-to-r from-white to-blue-400 bg-clip-text text-transparent leading-none">
                Eliminar Archivos
              </h1>
              <p className="text-[10px] text-slate-500 uppercase tracking-wider font-medium mt-1">
                Gestión de Almacenamiento
              </p>
            </div>
          </div>
          <button
            onClick={() => { logout(); navigate("/"); }}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-rose-400 hover:bg-rose-500/10 rounded-lg transition-all"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Cerrar sesión</span>
          </button>
        </div>
      </nav>

      {/* Contenedor Central */}
      <main className="flex-1 flex justify-center items-start md:items-center p-4 md:p-8">
        <div className="w-full max-w-2xl bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-300">
          
          <div className="p-6">
            {/* Banner de Advertencia Informativa */}
            <div className="mb-6 flex items-start gap-3 p-4 bg-amber-500/5 border border-amber-500/20 rounded-2xl">
              <Info className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
              <p className="text-xs text-amber-200/70 leading-relaxed">
                La eliminación de archivos es irreversible. Los documentos eliminados dejarán de estar disponibles para el motor de búsqueda del chat inmediatamente.
              </p>
            </div>

            {mensaje && (
              <div className={`mb-6 p-3 rounded-xl text-center text-sm font-medium animate-in slide-in-from-top-2 duration-300 ${
                mensaje.includes("✅") ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-400" : "bg-rose-500/10 border border-rose-500/30 text-rose-400"
              }`}>
                {mensaje}
              </div>
            )}

            {/* Lista de Archivos */}
            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
              {archivos.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="h-12 w-12 text-slate-700 mx-auto mb-3 opacity-20" />
                  <p className="text-slate-500 italic">No se encontraron archivos en el servidor.</p>
                </div>
              ) : (
                archivos.map((nombre) => (
                  <div
                    key={nombre}
                    className="group flex justify-between items-center bg-white/5 border border-white/5 hover:border-blue-500/30 p-4 rounded-2xl transition-all duration-300 hover:bg-white/[0.07]"
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className="bg-slate-800 p-2 rounded-lg text-slate-400 group-hover:text-blue-400 transition-colors">
                        <FileText size={18} />
                      </div>
                      <span className="text-sm text-slate-300 truncate font-medium">{nombre}</span>
                    </div>
                    <button
                      onClick={() => eliminarArchivo(nombre)}
                      className="ml-4 p-2.5 text-slate-500 hover:text-white hover:bg-rose-600 rounded-xl transition-all duration-200 shadow-sm"
                      title="Eliminar archivo"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Footer Informativo */}
          <div className="px-6 py-4 bg-black/20 border-t border-white/5 text-center">
            <p className="text-[10px] text-slate-600 uppercase tracking-[0.2em]">
              Total de archivos detectados: {archivos.length}
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DeleteFiles;
