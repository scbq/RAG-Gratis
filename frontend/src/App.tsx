import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import UserManagement from "./pages/UserManagement";
import AdminDashboard from "./pages/AdminDashboard";
import UserDashboard from "./pages/UserDashboard";
import Chat from "./pages/Chat";
import DeleteFiles from "./pages/DeleteFiles";
import { AuthProvider, useAuth } from "./context/AuthContext";

const PrivateRoute = ({ children, allowedRole }: { children: JSX.Element; allowedRole: string }) => {
  const { isAuthenticated, role } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/" />;
  }

  if (role !== allowedRole) {
    return <Navigate to="/" />;
  }

  return children;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Login />} />

          {/* Rutas para ADMIN */}
          <Route
            path="/admin"
            element={
              <PrivateRoute allowedRole="admin">
                <AdminDashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/gestion-usuarios"
            element={
              <PrivateRoute allowedRole="admin">
                <UserManagement />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/chat"
            element={
              <PrivateRoute allowedRole="admin">
                <Chat />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/eliminar-archivos"
            element={
              <PrivateRoute allowedRole="admin">
                <DeleteFiles />
              </PrivateRoute>
            }
          />

          {/* Rutas para USUARIO */}
          <Route
            path="/user"
            element={
              <PrivateRoute allowedRole="user">
                <UserDashboard />
              </PrivateRoute>
            }
          />

          {/* Página no encontrada */}
          <Route
            path="*"
            element={<div className="text-center text-2xl mt-10">🚫 Página no encontrada</div>}
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
