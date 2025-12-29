import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, Mail, MessageSquare } from "lucide-react"; // Añadido MessageSquare para el logo
import { useAuth } from "../context/AuthContext";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const navigate = useNavigate();
  const { login, role } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    try {
      await login(email, password);
      if (role === "admin") {
        navigate("/admin");
      } else {
        navigate("/user");
      }
    } catch (error) {
      console.error("Error al iniciar sesión:", error);
      setErrorMsg("Credenciales inválidas. Intenta nuevamente.");
    }
  };

  return (
    <div className="min-h-screen bg-[#0a192f] flex items-center justify-center p-4">
      {/* Fondo decorativo con gradiente suave */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] rounded-full bg-blue-900/20 blur-[120px]" />
        <div className="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] rounded-full bg-slate-800/30 blur-[120px]" />
      </div>

      <div className="relative bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-2xl shadow-2xl w-full max-w-md transition-all">
        {/* Encabezado con Icono */}
        <div className="flex flex-col items-center mb-8">
          <div className="bg-blue-600 p-3 rounded-xl mb-4 shadow-lg shadow-blue-500/20">
            <MessageSquare className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-3xl font-extrabold text-white tracking-tight">BEI Chat</h2>
          <p className="text-slate-400 text-sm mt-2">Bienvenido de nuevo, ingresa tus datos</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email Field */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5 ml-1">Email</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none transition-colors group-focus-within:text-blue-400 text-slate-500">
                <Mail className="h-5 w-5" />
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="pl-10 block w-full bg-slate-900/50 border border-slate-700 rounded-xl py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all sm:text-sm"
                placeholder="nombre@empresa.com"
              />
            </div>
          </div>

          {/* Password Field */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5 ml-1">Contraseña</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none transition-colors group-focus-within:text-blue-400 text-slate-500">
                <Lock className="h-5 w-5" />
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="pl-10 block w-full bg-slate-900/50 border border-slate-700 rounded-xl py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all sm:text-sm"
                placeholder="••••••••"
              />
            </div>
          </div>

          {/* Mensaje de Error */}
          {errorMsg && (
            <div className="bg-red-500/10 border border-red-500/50 p-3 rounded-lg flex items-center gap-2 animate-shake">
              <p className="text-red-400 text-xs font-medium uppercase tracking-wide">
                ⚠️ {errorMsg}
              </p>
            </div>
          )}

          <button
            type="submit"
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-lg text-sm font-bold text-white bg-blue-600 hover:bg-blue-500 active:scale-[0.98] transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 focus:ring-offset-slate-900"
          >
            Iniciar sesión
          </button>
        </form>

        {/* Pie de página decorativo */}
        <div className="mt-8 pt-6 border-t border-white/5 text-center">
          <p className="text-slate-500 text-xs">
            © 2025 BEI Chat - Panel de Seguridad
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;