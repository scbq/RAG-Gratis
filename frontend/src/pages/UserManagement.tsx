import { useState } from "react";
import axios from "axios";
import { ArrowLeftCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

const UserManagement = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("user");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleUserCreation = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const endpoint =
        role === "admin" ? "/registro_admin" : "/registro_usuario";

      const response = await axios.post(`http://127.0.0.1:8000${endpoint}`, {
        email,
        password,
      });

      setMessage(response.data.mensaje);
      setEmail("");
      setPassword("");
      setRole("user");
    } catch (error: any) {
      setMessage(
        error.response?.data?.detail || "Ocurrió un error al registrar usuario."
      );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-xl mx-auto bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold">👤 Gestión de Usuarios</h1>
          <button
            onClick={() => navigate("/admin")}
            className="text-blue-600 hover:text-blue-800 flex items-center"
          >
            <ArrowLeftCircle className="mr-1" />
            Volver
          </button>
        </div>

        <form onSubmit={handleUserCreation} className="space-y-4">
          <div>
            <label className="block text-sm font-medium">Email</label>
            <input
              type="email"
              value={email}
              required
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border px-3 py-2 rounded-md"
              placeholder="usuario@correo.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Contraseña</label>
            <input
              type="password"
              value={password}
              required
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border px-3 py-2 rounded-md"
              placeholder="********"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Rol</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full border px-3 py-2 rounded-md"
            >
              <option value="user">Usuario</option>
              <option value="admin">Administrador</option>
            </select>
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700"
          >
            Crear Usuario
          </button>
        </form>

        {message && (
          <div className="mt-4 text-sm text-center text-green-600 font-semibold">
            {message}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserManagement;
