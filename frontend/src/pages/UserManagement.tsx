import { useEffect, useState } from "react";
import axios from "axios";
import { ArrowLeftCircle, LogOut, Plus, Trash2, Pencil, X, Search, User, Shield, Check, Key } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const UserManagement = () => {
  const [usuarios, setUsuarios] = useState<any[]>([]);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [nuevoUsuario, setNuevoUsuario] = useState({
    rut: "", nombre: "", apellido: "", email: "", password: "", role: "user",
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
    } catch (error) {
      console.error("Error al obtener usuarios:", error);
    }
  };

  useEffect(() => { obtenerUsuarios(); }, []);

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
      setNuevoUsuario({ rut: "", nombre: "", apellido: "", email: "", password: "", role: "user" });
      obtenerUsuarios();
    } catch (error) {
      setMensaje("❌ Error al crear usuario");
    }
  };

  const handleResetPassword = async (rut: string) => {
    try {
      const nuevaPass = resetPassword[rut];
      await axios.put(
        `http://localhost:8000/usuarios/reset_password/${rut}`,
        { nueva_password: nuevaPass },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      setMensaje(`🔒 Contraseña de ${rut} restablecida`);
      setResetPassword((prev) => ({ ...prev, [rut]: "" }));
    } catch (error) {
      setMensaje("❌ Error al restablecer contraseña");
    }
  };

  const handleEliminar = async (rut: string) => {
    if (!window.confirm("¿Eliminar este usuario?")) return;
    try {
      await axios.delete(`http://localhost:8000/usuarios/${rut}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setMensaje("🗑️ Usuario eliminado");
      obtenerUsuarios();
    } catch (error) {
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
      setMensaje("❌ Error al actualizar usuario");
    }
  };

  return (
    <div className="min-h-screen bg-[#0a192f] text-slate-200 relative overflow-hidden flex flex-col">
     
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-900/20 rounded-full blur-[120px]" />
      </div>

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
              <h1 className="text-xl font-bold bg-gradient-to-r from-white to-blue-400 bg-clip-text text-transparent leading-none">
                Gestión de Usuarios
              </h1>
              <p className="text-[10px] text-slate-500 uppercase tracking-wider font-medium mt-1">
                Administra accesos y credenciales
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

      <main className="max-w-6xl mx-auto w-full p-4 md:p-8 space-y-6">
        
        {mensaje && (
          <div className="bg-blue-500/10 border border-blue-500/30 text-blue-400 px-4 py-3 rounded-xl text-center text-sm font-medium animate-pulse">
            {mensaje}
          </div>
        )}

        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-96 group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
            <input
              type="text"
              placeholder="Buscar por RUT..."
              value={filtroRut}
              onChange={(e) => setFiltroRut(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
            />
          </div>
          {!mostrarFormulario && (
            <button
              onClick={() => setMostrarFormulario(true)}
              className="w-full md:w-auto flex items-center justify-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-semibold shadow-lg shadow-blue-500/20 transition-all active:scale-95"
            >
              <Plus size={18} /> Nuevo Usuario
            </button>
          )}
        </div>

        {mostrarFormulario && (
          <div className="bg-white/10 backdrop-blur-2xl border border-white/20 rounded-2xl p-6 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold text-white">Registrar nuevo usuario</h2>
              <button onClick={() => setMostrarFormulario(false)} className="text-slate-400 hover:text-white"><X /></button>
            </div>
            <form onSubmit={handleCrearUsuario} className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <input type="text" placeholder="RUT (12345678-9)" value={nuevoUsuario.rut} onChange={(e) => setNuevoUsuario({ ...nuevoUsuario, rut: formatearRut(e.target.value) })} className="bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-2 text-white focus:border-blue-500 outline-none" required />
              <input type="text" placeholder="Nombre" value={nuevoUsuario.nombre} onChange={(e) => setNuevoUsuario({ ...nuevoUsuario, nombre: e.target.value })} className="bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-2 text-white focus:border-blue-500 outline-none" required />
              <input type="text" placeholder="Apellido" value={nuevoUsuario.apellido} onChange={(e) => setNuevoUsuario({ ...nuevoUsuario, apellido: e.target.value })} className="bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-2 text-white focus:border-blue-500 outline-none" required />
              <input type="email" placeholder="Email" value={nuevoUsuario.email} onChange={(e) => setNuevoUsuario({ ...nuevoUsuario, email: e.target.value })} className="bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-2 text-white focus:border-blue-500 outline-none" required />
              <input type="password" placeholder="Contraseña" value={nuevoUsuario.password} onChange={(e) => setNuevoUsuario({ ...nuevoUsuario, password: e.target.value })} className="bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-2 text-white focus:border-blue-500 outline-none" required />
              <select value={nuevoUsuario.role} onChange={(e) => setNuevoUsuario({ ...nuevoUsuario, role: e.target.value })} className="bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-2 text-white focus:border-blue-500 outline-none">
                <option value="user" className="bg-[#0a192f]">Usuario</option>
                <option value="admin" className="bg-[#0a192f]">Administrador</option>
              </select>
              <div className="md:col-span-3 flex justify-end gap-3 mt-2">
                <button type="button" onClick={() => setMostrarFormulario(false)} className="px-6 py-2 rounded-lg bg-white/5 text-slate-400 hover:bg-white/10">Cancelar</button>
                <button type="submit" className="px-6 py-2 rounded-lg bg-blue-600 text-white font-bold hover:bg-blue-500 shadow-lg shadow-blue-600/20">Crear Usuario</button>
              </div>
            </form>
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 pb-10">
          {usuarios
            .filter((user) => user.rut.toLowerCase().includes(filtroRut.toLowerCase()))
            .map((user) => (
              <div key={user.rut} className={`bg-white/5 backdrop-blur-md border rounded-2xl p-5 transition-all ${editando === user.rut ? "border-blue-500/50 ring-1 ring-blue-500/50 bg-blue-500/5" : "border-white/10 hover:border-white/20"}`}>
                {editando === user.rut ? (
                  <div className="flex flex-col gap-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                      <input value={user.nombre} onChange={(e) => setUsuarios(prev => prev.map(u => u.rut === user.rut ? { ...u, nombre: e.target.value } : u))} className="bg-slate-900/50 border border-slate-700 p-2 rounded-lg text-sm text-white" />
                      <input value={user.apellido} onChange={(e) => setUsuarios(prev => prev.map(u => u.rut === user.rut ? { ...u, apellido: e.target.value } : u))} className="bg-slate-900/50 border border-slate-700 p-2 rounded-lg text-sm text-white" />
                      <input value={user.email} onChange={(e) => setUsuarios(prev => prev.map(u => u.rut === user.rut ? { ...u, email: e.target.value } : u))} className="bg-slate-900/50 border border-slate-700 p-2 rounded-lg text-sm text-white" />
                      <select value={user.role} onChange={(e) => setUsuarios(prev => prev.map(u => u.rut === user.rut ? { ...u, role: e.target.value } : u))} className="bg-slate-900/50 border border-slate-700 p-2 rounded-lg text-sm text-white">
                        <option value="user" className="bg-[#0a192f]">Usuario</option>
                        <option value="admin" className="bg-[#0a192f]">Administrador</option>
                      </select>
                    </div>
                    <div className="flex justify-end gap-2">
                      <button onClick={() => setEditando(null)} className="p-2 rounded-lg bg-white/5 text-slate-400 hover:text-white"><X size={20}/></button>
                      <button onClick={() => handleActualizar(user)} className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-sm font-bold"><Check size={18}/> Guardar</button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className={`h-10 w-10 rounded-full flex items-center justify-center font-bold ${user.role === 'admin' ? 'bg-amber-500/20 text-amber-500' : 'bg-blue-500/20 text-blue-400'}`}>
                        {user.nombre.charAt(0)}{user.apellido.charAt(0)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-white">{user.nombre} {user.apellido}</p>
                          {user.role === 'admin' && <Shield className="h-3 w-3 text-amber-500" />}
                        </div>
                        <p className="text-xs text-slate-400">{user.rut} • {user.email}</p>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 bg-white/5 p-2 rounded-xl border border-white/5">
                      <div className="flex items-center gap-2">
                        <input
                          type="password"
                          placeholder="Nueva clave"
                          value={resetPassword[user.rut] || ""}
                          onChange={(e) => setResetPassword(prev => ({ ...prev, [user.rut]: e.target.value }))}
                          className="bg-slate-900/50 border border-slate-700 px-3 py-1.5 rounded-lg text-xs text-white outline-none w-28"
                        />
                        <button onClick={() => handleResetPassword(user.rut)} className="p-2 bg-blue-600/20 text-blue-400 hover:bg-blue-600 hover:text-white rounded-lg transition-all">
                          <Key size={16} />
                        </button>
                      </div>
                      <div className="h-6 w-[1px] bg-white/10 mx-1 hidden md:block" />
                      <button onClick={() => setEditando(user.rut)} className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg"><Pencil size={18} /></button>
                      <button onClick={() => handleEliminar(user.rut)} className="p-2 text-rose-500/70 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg"><Trash2 size={18} /></button>
                    </div>
                  </div>
                )}
              </div>
            ))}
        </div>
      </main>
    </div>
  );
};

export default UserManagement;