import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
      {/* Navbar */}
      <nav className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">✂️ Cadeira Livre</h1>
          <button
            onClick={handleLogout}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition"
          >
            Sair
          </button>
        </div>
      </nav>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">
            Bem-vindo, {user?.nome}!
          </h2>
          <p className="text-gray-600 mb-6">
            Email: <code className="bg-gray-100 px-2 py-1 rounded">{user?.email}</code>
          </p>
          <p className="text-gray-600 mb-6">
            Tipo: <code className="bg-gray-100 px-2 py-1 rounded">{user?.tipo_usuario}</code>
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
            {user?.tipo_usuario === "barbearia" ? (
              <>
                <button
                  onClick={() => navigate("/barbearia")}
                  className="bg-amber-50 p-6 rounded-lg border border-amber-200 hover:shadow-lg hover:bg-amber-100 transition cursor-pointer text-left"
                >
                  <h3 className="font-semibold text-amber-900 mb-2">Minha Barbearia</h3>
                  <p className="text-amber-700">Configurar funcionamento, barbeiros e disponibilidade</p>
                </button>
                <button
                  onClick={() => navigate("/barbearia/agendamentos")}
                  className="bg-orange-50 p-6 rounded-lg border border-orange-200 hover:shadow-lg hover:bg-orange-100 transition cursor-pointer text-left"
                >
                  <h3 className="font-semibold text-orange-900 mb-2">Agenda da Barbearia</h3>
                  <p className="text-orange-700">Ver agenda por barbeiro e próximos atendimentos</p>
                </button>
              </>
            ) : null}
            <button
              onClick={() => navigate("/novo-agendamento")}
              className="bg-blue-50 p-6 rounded-lg border border-blue-200 hover:shadow-lg hover:bg-blue-100 transition cursor-pointer text-left"
            >
              <h3 className="font-semibold text-blue-900 mb-2">Novo Agendamento</h3>
              <p className="text-blue-700">Agendar um novo horário</p>
            </button>
            <button
              onClick={() => navigate("/agendamentos")}
              className="bg-green-50 p-6 rounded-lg border border-green-200 hover:shadow-lg hover:bg-green-100 transition cursor-pointer text-left"
            >
              <h3 className="font-semibold text-green-900 mb-2">Meus Agendamentos</h3>
              <p className="text-green-700">Gerenciar meus agendamentos</p>
            </button>
            <div className="bg-purple-50 p-6 rounded-lg border border-purple-200">
              <h3 className="font-semibold text-purple-900 mb-2">Perfil</h3>
              <p className="text-purple-700">Editar meu perfil</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
