// src/App.tsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import AdminDashboard from "./pages/AdminDashboard";
import UserDashboard from "./pages/UserDashboard";
import { AuthProvider } from "./context/AuthContext"; // 👈 Importa el proveedor de contexto

function App() {
  return (
    <AuthProvider> {/* 👈 Envolver toda la app */}
      <BrowserRouter>
        <Routes>
          {/* Ruta por defecto */}
          <Route path="/" element={<Navigate to="/login" />} />

          {/* Login */}
          <Route path="/login" element={<Login />} />

          {/* Vistas según rol */}
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/usuario" element={<UserDashboard />} />

          {/* Ruta para no encontradas */}
          <Route
            path="*"
            element={<div className="p-4 text-red-500">Página no encontrada</div>}
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
