import { useNavigate } from "react-router-dom";
import { FileText, UserPlus, Trash2, LogOut } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center px-4">
      <h1 className="text-3xl font-bold mb-8 text-gray-800">Panel de Administración</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-xl">
        {/* 📁 Chat con PDFs */}
        <button
          onClick={() => navigate("/admin/chat")}
          className="flex items-center justify-start gap-4 p-4 bg-white rounded-lg shadow-md hover:bg-blue-50 transition"
        >
          <FileText className="h-6 w-6 text-blue-600" />
          <span className="font-medium text-gray-700">📁 Chat con PDFs</span>
        </button>

        {/* 👤 Gestión de usuarios */}
        <button
          onClick={() => navigate("/admin/gestion-usuarios")}
          className="flex items-center justify-start gap-4 p-4 bg-white rounded-lg shadow-md hover:bg-green-50 transition"
        >
          <UserPlus className="h-6 w-6 text-green-600" />
          <span className="font-medium text-gray-700">👤 Gestión de Usuarios</span>
        </button>

        {/* 🗑️ Eliminar archivos */}
        <button
          onClick={() => navigate("/admin/eliminar-archivos")}
          className="flex items-center justify-start gap-4 p-4 bg-white rounded-lg shadow-md hover:bg-red-50 transition"
        >
          <Trash2 className="h-6 w-6 text-red-600" />
          <span className="font-medium text-gray-700">🗑️ Eliminar Archivos</span>
        </button>

        {/* 🔒 Cerrar sesión */}
        <button
          onClick={handleLogout}
          className="flex items-center justify-start gap-4 p-4 bg-white rounded-lg shadow-md hover:bg-gray-50 transition"
        >
          <LogOut className="h-6 w-6 text-gray-600" />
          <span className="font-medium text-gray-700">🔒 Cerrar Sesión</span>
        </button>
      </div>
    </div>
  );
};

export default AdminDashboard;
