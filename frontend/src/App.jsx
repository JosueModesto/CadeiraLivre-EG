import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Agendamentos from "./pages/Agendamentos";
import NovoAgendamento from "./pages/NovoAgendamento";
import Barbearia from "./pages/Barbearia";
import BarbeariaAgendamentos from "./pages/BarbeariaAgendamentos";

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/agendamentos"
            element={
              <ProtectedRoute>
                <Agendamentos />
              </ProtectedRoute>
            }
          />
          <Route
            path="/novo-agendamento"
            element={
              <ProtectedRoute>
                <NovoAgendamento />
              </ProtectedRoute>
            }
          />
          <Route
            path="/barbearia"
            element={
              <ProtectedRoute>
                <Barbearia />
              </ProtectedRoute>
            }
          />
          <Route
            path="/barbearia/agendamentos"
            element={
              <ProtectedRoute>
                <BarbeariaAgendamentos />
              </ProtectedRoute>
            }
          />
          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}
