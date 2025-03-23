import { useEffect, useState } from "react";
import axios from "axios";
import { ArrowLeftCircle, LogOut, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

interface Usuario {
  rut: string;
  nombre: string;
  apellido: string;
  email: string;
  role: string;
}

const UserManagement = () => {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [nuevo, setNuevo] = useState({
    rut: "",
    nombre: "",
    apellido: "",
    email: "",
    password: "",
    role: "user",
  });
  const [mensaje, setMensaje] = useState("");
  const [resetPassword, setResetPassword] = useState<{ [key: string]: string }>({});

  const { logout } = useAuth();
  const navigate = useNavigate();

  const obtenerUsuarios = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("http://localhost:8000/usuarios", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsuarios(response.data);
    } catch (error) {
      console.error("Error al obtener usuarios:", error);
      setMensaje("❌ No se pudieron cargar los usuarios.");
    }
  };

  useEffect(() => {
    obtenerUsuarios();
  }, []);

  const handleCrearUsuario = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        "http://localhost:8000/registro_usuario",
        nuevo,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setMensaje("✅ Usuario creado correctamente");
      setNuevo({ rut: "", nombre: "", apellido: "", email: "", password: "", role: "user" });
      setMostrarFormulario(false);
      obtenerUsuarios();
    } catch (error) {
      console.error("Error al crear usuario:", error);
      setMensaje("❌ Error al crear usuario");
    }
  };

  const handleResetPassword = async (email: string) => {
    try {
      const token = localStorage.getItem("token");
      const nueva_password = resetPassword[email];
      await axios.put(
        "http://localhost:8000/usuarios/reset_password",
        null,
        {
          params: { email, nueva_password },
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setMensaje(`🔒 Contraseña de ${email} actualizada`);
      setResetPassword((prev) => ({ ...prev, [email]: "" }));
    } catch (error) {
      console.error("Error al restablecer contraseña:", error);
      setMensaje("❌ Error al restablecer contraseña");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-md p-6 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-bold">👤 Gestión de Usuarios</h1>
          <div className="flex items-center gap-4">
            <button onClick={() => navigate("/admin")} className="text-blue-600 hover:text-blue-800 flex items-center">
              <ArrowLeftCircle className="mr-1" />
              Volver
            </button>
            <button onClick={() => { logout(); navigate("/login"); }} className="text-red-600 hover:underline">
              <LogOut className="inline w-4 h-4 mr-1" />
              Cerrar sesión
            </button>
          </div>
        </div>

        {mensaje && (
          <div className="text-center text-green-600 font-semibold text-sm">{mensaje}</div>
        )}

        <div>
          <h2 className="text-md font-semibold mb-2">Usuarios existentes:</h2>
          <ul className="space-y-3">
            {usuarios.length === 0 ? (
              <p className="text-gray-500">No hay usuarios registrados.</p>
            ) : (
              usuarios.map((user) => (
                <li key={user.rut} className="border rounded-md p-3 shadow-sm">
                  <div className="text-sm text-gray-800 font-medium">
                    {user.nombre} {user.apellido} ({user.email}) - Rol: {user.role}
                  </div>
                  <div className="flex mt-2 gap-2">
                    <input
                      type="password"
                      placeholder="Nueva contraseña"
                      value={resetPassword[user.email] || ""}
                      onChange={(e) =>
                        setResetPassword((prev) => ({ ...prev, [user.email]: e.target.value }))
                      }
                      className="border px-2 py-1 rounded-md text-sm w-full"
                    />
                    <button
                      onClick={() => handleResetPassword(user.email)}
                      className="text-sm bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded-md"
                    >
                      Restablecer
                    </button>
                  </div>
                </li>
              ))
            )}
          </ul>
        </div>

        {!mostrarFormulario && (
          <div className="text-center">
            <button
              onClick={() => setMostrarFormulario(true)}
              className="mt-4 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 inline-flex items-center"
            >
              <Plus className="w-4 h-4 mr-2" />
              Agregar nuevo usuario
            </button>
          </div>
        )}

        {mostrarFormulario && (
          <form onSubmit={handleCrearUsuario} className="space-y-4">
            <input
              type="text"
              placeholder="RUT"
              value={nuevo.rut}
              onChange={(e) => setNuevo({ ...nuevo, rut: e.target.value })}
              className="w-full border px-3 py-2 rounded-md text-sm"
              required
            />
            <input
              type="text"
              placeholder="Nombre"
              value={nuevo.nombre}
              onChange={(e) => setNuevo({ ...nuevo, nombre: e.target.value })}
              className="w-full border px-3 py-2 rounded-md text-sm"
              required
            />
            <input
              type="text"
              placeholder="Apellido"
              value={nuevo.apellido}
              onChange={(e) => setNuevo({ ...nuevo, apellido: e.target.value })}
              className="w-full border px-3 py-2 rounded-md text-sm"
              required
            />
            <input
              type="email"
              placeholder="Correo electrónico"
              value={nuevo.email}
              onChange={(e) => setNuevo({ ...nuevo, email: e.target.value })}
              className="w-full border px-3 py-2 rounded-md text-sm"
              required
            />
            <input
              type="password"
              placeholder="Contraseña"
              value={nuevo.password}
              onChange={(e) => setNuevo({ ...nuevo, password: e.target.value })}
              className="w-full border px-3 py-2 rounded-md text-sm"
              required
            />
            <select
              value={nuevo.role}
              onChange={(e) => setNuevo({ ...nuevo, role: e.target.value })}
              className="w-full border px-3 py-2 rounded-md text-sm"
            >
              <option value="user">Usuario</option>
              <option value="admin">Administrador</option>
            </select>
            <div className="flex gap-3">
              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-md text-sm font-semibold"
              >
                Crear Usuario
              </button>
              <button
                type="button"
                onClick={() => setMostrarFormulario(false)}
                className="w-full bg-gray-300 hover:bg-gray-400 text-gray-800 py-2 rounded-md text-sm font-semibold"
              >
                Cancelar
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default UserManagement;
