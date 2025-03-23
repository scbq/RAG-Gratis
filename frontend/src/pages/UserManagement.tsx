import { useEffect, useState } from "react";
import axios from "axios";
import { ArrowLeftCircle, LogOut, Plus, Trash2, Pencil, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// Valida y formatea el RUT (incluye dígito verificador)
const formatearRut = (rut: string) => {
  rut = rut.replace(/[^0-9kK]/g, "").toUpperCase();
  if (rut.length < 2) return rut;
  const cuerpo = rut.slice(0, -1);
  const dv = rut.slice(-1);
  return `${Number(cuerpo).toLocaleString("es-CL")}-${dv}`;
};

const validarRut = (rut: string) => {
  rut = rut.replace(/\./g, "").replace("-", "").toUpperCase();
  if (!/^[0-9]+[0-9Kk]$/.test(rut)) return false;
  const cuerpo = rut.slice(0, -1);
  const dv = rut.slice(-1);
  let suma = 0;
  let multiplo = 2;
  for (let i = cuerpo.length - 1; i >= 0; i--) {
    suma += parseInt(cuerpo.charAt(i)) * multiplo;
    multiplo = multiplo < 7 ? multiplo + 1 : 2;
  }
  const dvEsperado = 11 - (suma % 11);
  const dvCalculado = dvEsperado === 11 ? "0" : dvEsperado === 10 ? "K" : dvEsperado.toString();
  return dvCalculado === dv;
};

const UserManagement = () => {
  const [usuarios, setUsuarios] = useState<any[]>([]);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [nuevoUsuario, setNuevoUsuario] = useState({
    rut: "",
    nombre: "",
    apellido: "",
    email: "",
    password: "",
    role: "user",
  });
  const [resetPassword, setResetPassword] = useState<{ [key: string]: string }>({});
  const [editando, setEditando] = useState<string | null>(null);
  const [mensaje, setMensaje] = useState("");
  const [filtroRut, setFiltroRut] = useState("");

  const { logout } = useAuth();
  const navigate = useNavigate();

  const obtenerUsuarios = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("http://localhost:8000/usuarios", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsuarios(response.data);
      setFiltroRut("");
    } catch (error) {
      console.error("Error al obtener usuarios:", error);
    }
  };

  useEffect(() => {
    obtenerUsuarios();
  }, []);

  const handleCrearUsuario = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validarRut(nuevoUsuario.rut)) {
      setMensaje("❌ RUT inválido. Ejemplo válido: 12345678-9");
      return;
    }

    try {
      await axios.post("http://localhost:8000/registro_usuario", nuevoUsuario);
      setMensaje("✅ Usuario creado correctamente");
      setMostrarFormulario(false);
      setNuevoUsuario({
        rut: "",
        nombre: "",
        apellido: "",
        email: "",
        password: "",
        role: "user",
      });
      obtenerUsuarios();
    } catch (error) {
      console.error("Error al crear usuario:", error);
      setMensaje("❌ Error al crear usuario");
    }
  };

  const handleResetPassword = async (rut: string) => {
    try {
      const nuevaPass = resetPassword[rut];
      await axios.put(
        "http://localhost:8000/usuarios/reset_password",
        { rut, nueva_password: nuevaPass },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      setMensaje(`🔒 Contraseña de ${rut} restablecida`);
      setResetPassword((prev) => ({ ...prev, [rut]: "" }));
    } catch (error) {
      console.error("Error al restablecer contraseña:", error);
      setMensaje("❌ Error al restablecer contraseña");
    }
  };

  const handleEliminar = async (rut: string) => {
    try {
      await axios.delete(`http://localhost:8000/usuarios/${rut}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setMensaje("🗑️ Usuario eliminado");
      obtenerUsuarios();
    } catch (error) {
      console.error("Error al eliminar usuario:", error);
      setMensaje("❌ Error al eliminar usuario");
    }
  };

  const handleActualizar = async (usuario: any) => {
    try {
      await axios.put(`http://localhost:8000/usuarios/${usuario.rut}`, usuario, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setMensaje("✅ Usuario actualizado");
      setEditando(null);
      obtenerUsuarios();
    } catch (error) {
      console.error("Error al actualizar usuario:", error);
      setMensaje("❌ Error al actualizar usuario");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-5xl mx-auto bg-white rounded-lg shadow-md p-6 space-y-6">
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

        {mensaje && <div className="text-center text-green-600 font-semibold text-sm">{mensaje}</div>}

        <div className="text-center">
          <input
            type="text"
            placeholder="Buscar por RUT..."
            value={filtroRut}
            onChange={(e) => setFiltroRut(e.target.value)}
            className="border px-3 py-2 rounded-md text-sm w-full sm:w-1/2 mb-4"
          />
        </div>

        <ul className="space-y-4">
          {usuarios
            .filter((user) => user.rut.toLowerCase().includes(filtroRut.toLowerCase()))
            .map((user) => (
              <li key={user.rut} className="border rounded-md p-3 shadow-sm">
                {editando === user.rut ? (
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div className="flex flex-wrap gap-2">
                      <input
                        value={user.nombre}
                        onChange={(e) => setUsuarios((prev) =>
                          prev.map((u) => u.rut === user.rut ? { ...u, nombre: e.target.value } : u))}
                        className="border p-1 rounded-md"
                      />
                      <input
                        value={user.apellido}
                        onChange={(e) => setUsuarios((prev) =>
                          prev.map((u) => u.rut === user.rut ? { ...u, apellido: e.target.value } : u))}
                        className="border p-1 rounded-md"
                      />
                      <input
                        value={user.email}
                        onChange={(e) => setUsuarios((prev) =>
                          prev.map((u) => u.rut === user.rut ? { ...u, email: e.target.value } : u))}
                        className="border p-1 rounded-md"
                      />
                      <select
                        value={user.role}
                        onChange={(e) => setUsuarios((prev) =>
                          prev.map((u) => u.rut === user.rut ? { ...u, role: e.target.value } : u))}
                        className="border p-1 rounded-md"
                      >
                        <option value="user">Usuario</option>
                        <option value="admin">Administrador</option>
                      </select>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleActualizar(user)}
                        className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-md text-sm"
                      >
                        Guardar
                      </button>
                      <button
                        onClick={() => setEditando(null)}
                        className="bg-gray-400 hover:bg-gray-500 text-white px-3 py-1 rounded-md text-sm"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <span>{user.rut} - {user.nombre} {user.apellido} - {user.email} ({user.role})</span>
                    <div className="flex gap-2">
                      <input
                        type="password"
                        placeholder="Nueva contraseña"
                        value={resetPassword[user.rut] || ""}
                        onChange={(e) => setResetPassword((prev) => ({ ...prev, [user.rut]: e.target.value }))}
                        className="border px-2 py-1 rounded-md text-sm"
                      />
                      <button
                        onClick={() => handleResetPassword(user.rut)}
                        className="bg-yellow-500 hover:bg-yellow-600 text-white px-2 py-1 rounded-md text-sm"
                      >
                        🔑
                      </button>
                      <button
                        onClick={() => setEditando(user.rut)}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded-md text-sm"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        onClick={() => handleEliminar(user.rut)}
                        className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded-md text-sm"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                )}
              </li>
            ))}
        </ul>

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
              placeholder="RUT (12345678-9)"
              value={nuevoUsuario.rut}
              onChange={(e) =>
                setNuevoUsuario({ ...nuevoUsuario, rut: formatearRut(e.target.value) })
              }
              className="w-full border px-3 py-2 rounded-md text-sm"
              required
            />
            <input
              type="text"
              placeholder="Nombre"
              value={nuevoUsuario.nombre}
              onChange={(e) => setNuevoUsuario({ ...nuevoUsuario, nombre: e.target.value })}
              className="w-full border px-3 py-2 rounded-md text-sm"
              required
            />
            <input
              type="text"
              placeholder="Apellido"
              value={nuevoUsuario.apellido}
              onChange={(e) => setNuevoUsuario({ ...nuevoUsuario, apellido: e.target.value })}
              className="w-full border px-3 py-2 rounded-md text-sm"
              required
            />
            <input
              type="email"
              placeholder="Email"
              value={nuevoUsuario.email}
              onChange={(e) => setNuevoUsuario({ ...nuevoUsuario, email: e.target.value })}
              className="w-full border px-3 py-2 rounded-md text-sm"
              required
            />
            <input
              type="password"
              placeholder="Contraseña"
              value={nuevoUsuario.password}
              onChange={(e) => setNuevoUsuario({ ...nuevoUsuario, password: e.target.value })}
              className="w-full border px-3 py-2 rounded-md text-sm"
              required
            />
            <select
              value={nuevoUsuario.role}
              onChange={(e) => setNuevoUsuario({ ...nuevoUsuario, role: e.target.value })}
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
