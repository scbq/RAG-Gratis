import { useNavigate } from "react-router-dom";
import { FileText, UserPlus, Trash2, LogOut, LayoutDashboard } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const menuItems = [
    {
      title: "Chat con PDFs",
      icon: <FileText className="h-6 w-6 text-blue-400" />,
      path: "/admin/chat",
      color: "hover:border-blue-500/50",
      bg: "bg-blue-500/10",
    },
    {
      title: "Gestión de Usuarios",
      icon: <UserPlus className="h-6 w-6 text-emerald-400" />,
      path: "/admin/gestion-usuarios",
      color: "hover:border-emerald-500/50",
      bg: "bg-emerald-500/10",
    },
    {
      title: "Eliminar Archivos",
      icon: <Trash2 className="h-6 w-6 text-rose-400" />,
      path: "/admin/eliminar-archivos",
      color: "hover:border-rose-500/50",
      bg: "bg-rose-500/10",
    },
  ];

  return (
    <div className="min-h-screen bg-[#0a192f] flex flex-col items-center justify-center px-4 relative overflow-hidden">
      {/* Elementos decorativos de fondo */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-900/20 rounded-full blur-[120px]" />
      </div>

      {/* Contenedor Principal */}
      <div className="w-full max-w-4xl">
        <div className="flex flex-col md:flex-row items-center justify-between mb-12 gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-600/20 rounded-2xl border border-blue-500/30">
              <LayoutDashboard className="h-8 w-8 text-blue-400" />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold text-white tracking-tight">
                Panel de Administración
              </h1>
              <p className="text-slate-400 text-sm">Gestiona los recursos de BEI Chat</p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="group flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-slate-300 hover:bg-rose-500/10 hover:border-rose-500/50 hover:text-rose-400 transition-all duration-300"
          >
            <LogOut className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium">Cerrar Sesión</span>
          </button>
        </div>

        {/* Rejilla de Opciones */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {menuItems.map((item, index) => (
            <button
              key={index}
              onClick={() => navigate(item.path)}
              className={`group relative flex flex-col items-center justify-center p-8 bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl transition-all duration-300 hover:-translate-y-2 ${item.color} hover:shadow-2xl hover:shadow-black/50`}
            >
              <div className={`p-4 rounded-2xl mb-4 transition-transform group-hover:scale-110 ${item.bg}`}>
                {item.icon}
              </div>
              <span className="text-slate-200 font-semibold text-lg text-center leading-tight">
                {item.title}
              </span>
              
              {/* Indicador visual de hover */}
              <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="w-2 h-2 rounded-full bg-white/20 animate-pulse" />
              </div>
            </button>
          ))}
        </div>

        {/* Footer info */}
        <p className="mt-12 text-center text-slate-500 text-xs uppercase tracking-[0.2em]">
          Sistema de gestión centralizada • v1.0
        </p>
      </div>
    </div>
  );
};

export default AdminDashboard;