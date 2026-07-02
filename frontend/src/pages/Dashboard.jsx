import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";

function Tile({ title, description, onClick }) {
  return (
    <button className="card" onClick={onClick} style={{ textAlign: "left", cursor: "pointer" }}>
      <h3 className="card-title" style={{ fontSize: "1.1rem" }}>{title}</h3>
      <p className="card-sub">{description}</p>
    </button>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isBarbearia = user?.tipo_usuario === "barbearia";

  return (
    <div className="app-shell">
      <Navbar />

      <main className="container page fade-in">
        <div className="section-label">
          {isBarbearia ? "Painel da barbearia" : "Área do cliente"}
        </div>
        <h1 className="page-title mt-2">
          Bem-vindo, <span className="accent">{user?.nome || "visitante"}</span>
        </h1>
        <p className="muted mt-2">
          {isBarbearia
            ? "Gerencie sua barbearia, barbeiros e a agenda de atendimentos."
            : "Reserve seu horário e acompanhe seus agendamentos."}
        </p>

        <div className="grid grid-3 mt-6">
          {isBarbearia && (
            <>
              <Tile
                title="Minha Barbearia"
                description="Funcionamento, barbeiros e disponibilidade."
                onClick={() => navigate("/barbearia")}
              />
              <Tile
                title="Agenda da Barbearia"
                description="Veja atendimentos por barbeiro e os próximos horários."
                onClick={() => navigate("/barbearia/agendamentos")}
              />
            </>
          )}

          {!isBarbearia && (
            <Tile
              title="Novo Agendamento"
              description="Escolha barbearia, serviços e horário."
              onClick={() => navigate("/novo-agendamento")}
            />
          )}
          <Tile
            title="Meus Agendamentos"
            description="Acompanhe suas reservas."
            onClick={() => navigate("/agendamentos")}
          />
        </div>

        <div className="card mt-6">
          <div className="section-label">Sua conta</div>
          <div className="grid grid-3 mt-4">
            <div>
              <p className="faint" style={{ fontSize: "0.78rem", textTransform: "uppercase", letterSpacing: "0.08em" }}>Nome</p>
              <p className="mt-2">{user?.nome}</p>
            </div>
            <div>
              <p className="faint" style={{ fontSize: "0.78rem", textTransform: "uppercase", letterSpacing: "0.08em" }}>E-mail</p>
              <p className="mt-2">{user?.email}</p>
            </div>
            <div>
              <p className="faint" style={{ fontSize: "0.78rem", textTransform: "uppercase", letterSpacing: "0.08em" }}>Tipo</p>
              <p className="mt-2">
                <span className="badge badge--gold">{user?.tipo_usuario}</span>
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
