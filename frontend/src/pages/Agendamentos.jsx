import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { agendamentoService } from "../services/agendamentoService";
import { servicoService } from "../services/servicoService";
import Navbar from "../components/Navbar";

function formatarDataHora(valor) {
  return new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short", timeZone: "UTC" }).format(new Date(valor));
}

function formatarMoeda(valor) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(Number(valor || 0));
}

const statusBadge = {
  agendado: "badge--gold",
  concluido: "badge--green",
  cancelado: "badge--red",
};

export default function Agendamentos() {
  const navigate = useNavigate();
  const [agendamentos, setAgendamentos] = useState([]);
  const [mapaServicos, setMapaServicos] = useState({});
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState(null);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    async function carregar() {
      setLoading(true);
      setError("");
      try {
        const response = await agendamentoService.getMyAppointments();
        const lista = response.agendamentos || [];
        setAgendamentos(lista);

        const barbeariasIds = [...new Set(lista.map((item) => item.barbearia?.id).filter(Boolean))];
        const respostasServicos = await Promise.all(
          barbeariasIds.map((barbeariaId) => servicoService.getAll({ barbearia_id: barbeariaId }))
        );

        const servicos = respostasServicos.flatMap((res) => res.servicos || []);
        const mapa = servicos.reduce((acc, servico) => {
          acc[servico.id] = servico.nome_servico;
          return acc;
        }, {});
        setMapaServicos(mapa);
      } catch (err) {
        setError(err.response?.data?.message || "Erro ao carregar agendamentos.");
      } finally {
        setLoading(false);
      }
    }
    carregar();
  }, []);

  async function cancelarAgendamento(agendamentoId) {
    const confirmar = window.confirm("Deseja realmente cancelar este agendamento?");
    if (!confirmar) return;

    setCancellingId(agendamentoId);
    setError("");
    setSuccess("");
    try {
      await agendamentoService.cancel(agendamentoId);
      setAgendamentos((current) =>
        current.map((item) => (item.id === agendamentoId ? { ...item, status: "cancelado" } : item))
      );
      setSuccess("Agendamento cancelado com sucesso.");
    } catch (err) {
      setError(err.response?.data?.message || "Não foi possível cancelar este agendamento.");
    } finally {
      setCancellingId(null);
    }
  }

  return (
    <div className="app-shell">
      <Navbar title="Meus agendamentos" onBack={() => navigate("/dashboard")} />

      <main className="container page fade-in">
        <div className="between" style={{ marginBottom: "24px" }}>
          <div>
            <h1 className="page-title">Meus agendamentos</h1>
            <p className="muted mt-2">Acompanhe suas reservas na barbearia.</p>
          </div>
          <button className="btn btn--primary" onClick={() => navigate("/novo-agendamento")}>
            + Novo agendamento
          </button>
        </div>

        {loading ? (
          <div className="card center">
            <div className="spinner" style={{ margin: "0 auto 16px" }} />
            <p className="muted">Carregando agendamentos...</p>
          </div>
        ) : (
          <>
            {error ? <div className="alert alert--error" style={{ marginBottom: "16px" }}>{error}</div> : null}
            {success ? <div className="alert alert--success" style={{ marginBottom: "16px" }}>{success}</div> : null}

            {agendamentos.length === 0 ? (
          <div className="card empty">
            <h2 className="card-title">Nenhum agendamento por aqui</h2>
            <p className="muted mt-2">Escolha uma barbearia e reserve seu primeiro horário.</p>
            <button className="btn btn--primary mt-6" onClick={() => navigate("/novo-agendamento")}>
              Agendar agora
            </button>
          </div>
            ) : (
          <div className="stack stack-5">
            {agendamentos.map((agendamento) => {
              const servicos = (agendamento.itens || []).map(
                (item) => mapaServicos[item.servico_id] || `Serviço #${item.servico_id}`
              );
              const badge = statusBadge[agendamento.status] || "";

              return (
                <article key={agendamento.id} className="card">
                  <div className="between wrap">
                    <div>
                      <h2 className="card-title">{agendamento.barbearia?.nome_comercial || "Barbearia"}</h2>
                      <p className="card-sub">Barbeiro: {agendamento.barbeiro?.nome || "Não informado"}</p>
                    </div>
                    <span className={`badge ${badge}`}>{agendamento.status}</span>
                  </div>

                  <div className="grid grid-3 mt-6">
                    <div>
                      <p className="section-label">Início</p>
                      <p className="mt-2" style={{ fontWeight: 600 }}>{formatarDataHora(agendamento.data_hora_inicio)}</p>
                    </div>
                    <div>
                      <p className="section-label">Término</p>
                      <p className="mt-2" style={{ fontWeight: 600 }}>{formatarDataHora(agendamento.data_hora_fim)}</p>
                    </div>
                    <div>
                      <p className="section-label">Valor total</p>
                      <p className="mt-2 gold" style={{ fontWeight: 700, fontSize: "1.1rem" }}>
                        {formatarMoeda(agendamento.valor_total)}
                      </p>
                    </div>
                  </div>

                  <div className="mt-6">
                    <p className="section-label">Serviços</p>
                    <div className="row wrap mt-4">
                      {servicos.length > 0 ? (
                        servicos.map((servico) => (
                          <span key={`${agendamento.id}-${servico}`} className="chip">{servico}</span>
                        ))
                      ) : (
                        <span className="muted">Sem serviços associados</span>
                      )}
                    </div>
                  </div>

                  {agendamento.status === "agendado" ? (
                    <div className="mt-6" style={{ display: "flex", justifyContent: "flex-end" }}>
                      <button
                        type="button"
                        className="btn btn--danger"
                        onClick={() => cancelarAgendamento(agendamento.id)}
                        disabled={cancellingId === agendamento.id}
                      >
                        {cancellingId === agendamento.id ? "Cancelando..." : "Cancelar agendamento"}
                      </button>
                    </div>
                  ) : null}
                </article>
              );
            })}
          </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
