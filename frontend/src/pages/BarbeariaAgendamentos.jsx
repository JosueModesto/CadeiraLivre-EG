import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { barbeariaService } from "../services/barbeariaService";
import { barbeiroService } from "../services/barbeiroService";
import { servicoService } from "../services/servicoService";
import Navbar from "../components/Navbar";

function formatarDataHora(valor) {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
    timeZone: "UTC",
  }).format(new Date(valor));
}

function obterIndicadores(agendamento) {
  const agora = new Date();
  const inicio = new Date(agendamento.data_hora_inicio);
  const fim = new Date(agendamento.data_hora_fim);
  const diffMin = (inicio.getTime() - agora.getTime()) / 60000;

  return {
    emAndamento: agora >= inicio && agora < fim && agendamento.status === "agendado",
    proximo: diffMin >= 0 && diffMin <= 30 && agendamento.status === "agendado",
  };
}

const statusClasses = {
  agendado: "badge--gold",
  concluido: "badge--green",
  cancelado: "badge--red",
};

function EstadoCentral({ titulo, descricao, onVoltar }) {
  return (
    <div className="app-shell">
      <Navbar onBack={onVoltar} />
      <main className="container page">
        <div className="card empty">
          <h1 className="card-title">{titulo}</h1>
          {descricao ? <p className="muted mt-2">{descricao}</p> : null}
          <button className="btn btn--primary mt-6" onClick={onVoltar}>Voltar</button>
        </div>
      </main>
    </div>
  );
}

export default function BarbeariaAgendamentos() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [barbearia, setBarbearia] = useState(null);
  const [barbeiros, setBarbeiros] = useState([]);
  const [barbeiroSelecionadoId, setBarbeiroSelecionadoId] = useState("");
  const [dataAgenda, setDataAgenda] = useState(new Date().toISOString().slice(0, 10));
  const [statusFiltro, setStatusFiltro] = useState("todos");
  const [agendaDia, setAgendaDia] = useState([]);
  const [proximosAgendamentos, setProximosAgendamentos] = useState([]);
  const [mapaServicos, setMapaServicos] = useState({});
  const [success, setSuccess] = useState("");
  const [cancellingId, setCancellingId] = useState(null);

  useEffect(() => {
    async function carregarBase() {
      setLoading(true);
      setError("");

      try {
        const response = await barbeariaService.getAll();
        const encontrada = (response.barbearias || []).find((item) => item.usuario_id === user?.id);

        if (!encontrada) {
          setBarbearia(null);
          return;
        }

        setBarbearia(encontrada);

        const [barbeirosResponse, servicosResponse] = await Promise.all([
          barbeiroService.getAll({ barbearia_id: encontrada.id }),
          servicoService.getAll({ barbearia_id: encontrada.id }),
        ]);

        const listaBarbeiros = barbeirosResponse.barbeiros || [];
        setBarbeiros(listaBarbeiros);
        if (listaBarbeiros.length > 0) {
          setBarbeiroSelecionadoId(String(listaBarbeiros[0].id));
        }

        const mapa = (servicosResponse.servicos || []).reduce((acc, servico) => {
          acc[servico.id] = servico.nome_servico;
          return acc;
        }, {});
        setMapaServicos(mapa);
      } catch (err) {
        setError(err.response?.data?.message || "Erro ao carregar agenda da barbearia");
      } finally {
        setLoading(false);
      }
    }

    if (user?.id) {
      carregarBase();
    }
  }, [user?.id]);

  useEffect(() => {
    async function carregarAgendaDia() {
      if (!barbearia || !barbeiroSelecionadoId || !dataAgenda) {
        setAgendaDia([]);
        return;
      }

      try {
        const response = await barbeariaService.getAgendamentos(barbearia.id, {
          barbeiro_id: barbeiroSelecionadoId,
          data: dataAgenda,
        });
        setAgendaDia(response.agendamentos || []);
      } catch (err) {
        setError(err.response?.data?.message || "Erro ao carregar agenda do barbeiro");
      }
    }

    carregarAgendaDia();
  }, [barbearia, barbeiroSelecionadoId, dataAgenda]);

  useEffect(() => {
    async function carregarProximos() {
      if (!barbearia) {
        setProximosAgendamentos([]);
        return;
      }

      try {
        const response = await barbeariaService.getProximosAgendamentos(barbearia.id);
        setProximosAgendamentos(response.agendamentos || []);
      } catch (err) {
        setError(err.response?.data?.message || "Erro ao carregar próximos agendamentos");
      }
    }

    carregarProximos();
  }, [barbearia]);

  const agendaFiltrada = useMemo(() => {
    return agendaDia.filter((agendamento) => statusFiltro === "todos" || agendamento.status === statusFiltro);
  }, [agendaDia, statusFiltro]);

  const proximosFiltrados = useMemo(() => {
    return proximosAgendamentos.filter((agendamento) => statusFiltro === "todos" || agendamento.status === statusFiltro);
  }, [proximosAgendamentos, statusFiltro]);

  async function cancelarAgendamento(agendamentoId) {
    if (!barbearia?.id) return;

    const confirmar = window.confirm("Deseja realmente cancelar este agendamento?");
    if (!confirmar) return;

    setCancellingId(agendamentoId);
    setError("");
    setSuccess("");

    try {
      await barbeariaService.cancelAgendamento(barbearia.id, agendamentoId);

      setAgendaDia((current) =>
        current.map((item) => (item.id === agendamentoId ? { ...item, status: "cancelado" } : item))
      );

      setProximosAgendamentos((current) => current.filter((item) => item.id !== agendamentoId));
      setSuccess("Agendamento cancelado com sucesso.");
    } catch (err) {
      setError(err.response?.data?.message || "Não foi possível cancelar este agendamento.");
      setConcludingId(null);
    }
  }

  if (loading) {
    return (
      <div className="app-shell">
        <Navbar title="Agenda da barbearia" onBack={() => navigate("/barbearia")} />
        <main className="container page center">
          <div className="spinner" style={{ margin: "48px auto 16px" }} />
          <p className="muted">Carregando agenda da barbearia...</p>
        </main>
      </div>
    );
  }

  if (user?.tipo_usuario !== "barbearia") {
    return <EstadoCentral titulo="Tela exclusiva para dono de barbearia" onVoltar={() => navigate("/dashboard")} />;
  }

  if (!barbearia) {
    return (
      <EstadoCentral
        titulo="Nenhuma barbearia encontrada para este usuário"
        descricao="Crie uma barbearia antes de usar esta tela de agenda."
        onVoltar={() => navigate("/dashboard")}
      />
    );
  }

  return (
    <div className="app-shell">
      <Navbar title="Agenda da barbearia" onBack={() => navigate("/barbearia")} />

      <main className="container page fade-in">
        <div className="between wrap" style={{ marginBottom: "24px" }}>
          <div>
            <h1 className="page-title">{barbearia.nome_comercial}</h1>
            <p className="muted mt-2">Acompanhe a agenda dos barbeiros e cancele quando necessário.</p>
          </div>
          <span className="badge badge--gold">Dono</span>
        </div>

        <section className="card" style={{ marginBottom: "16px" }}>
          <div className="grid grid-3">
            <div className="field">
              <label>Barbeiro</label>
              <select value={barbeiroSelecionadoId} onChange={(event) => setBarbeiroSelecionadoId(event.target.value)}>
                <option value="">Selecione</option>
                {barbeiros.map((barbeiro) => (
                  <option key={barbeiro.id} value={barbeiro.id}>{barbeiro.nome}</option>
                ))}
              </select>
            </div>

            <div className="field">
              <label>Data</label>
              <input type="date" value={dataAgenda} onChange={(event) => setDataAgenda(event.target.value)} />
            </div>

            <div className="field">
              <label>Status</label>
              <select value={statusFiltro} onChange={(event) => setStatusFiltro(event.target.value)}>
                <option value="todos">Todos</option>
                <option value="agendado">Agendado</option>
                <option value="concluido">Concluído</option>
                <option value="cancelado">Cancelado</option>
              </select>
            </div>
          </div>
        </section>

        {error ? <div className="alert alert--error" style={{ marginBottom: "16px" }}>{error}</div> : null}
        {success ? <div className="alert alert--success" style={{ marginBottom: "16px" }}>{success}</div> : null}

        <div className="grid grid-2" style={{ alignItems: "start" }}>
          <section className="card">
            <h2 className="card-title">Agendamentos do dia</h2>
            <p className="card-sub">Lista do barbeiro selecionado para a data escolhida.</p>

            <div className="stack stack-4 mt-6">
              {agendaFiltrada.length === 0 ? (
                <p className="muted">Nenhum agendamento encontrado para os filtros selecionados.</p>
              ) : (
                agendaFiltrada.map((agendamento) => {
                  const servicos = (agendamento.itens || []).map((item) => mapaServicos[item.servico_id] || `Serviço #${item.servico_id}`);
                  const indicadores = obterIndicadores(agendamento);
                  const statusClass = statusClasses[agendamento.status] || "badge--gold";

                  return (
                    <article key={agendamento.id} className="card" style={{ boxShadow: "none", background: "var(--wood-700)" }}>
                      <div className="between wrap">
                        <div>
                          <p style={{ fontWeight: 600 }}>{agendamento.cliente?.nome || "Cliente"}</p>
                          <p className="faint" style={{ fontSize: "0.85rem" }}>
                            {formatarDataHora(agendamento.data_hora_inicio)} - {formatarDataHora(agendamento.data_hora_fim)}
                          </p>
                        </div>
                        <div className="row wrap" style={{ gap: "8px" }}>
                          <span className={`badge ${statusClass}`}>{agendamento.status}</span>
                          {indicadores.emAndamento ? <span className="badge badge--green">Em andamento</span> : null}
                          {indicadores.proximo ? <span className="badge badge--gold">Próximo</span> : null}
                        </div>
                      </div>

                      <div className="row wrap mt-4" style={{ gap: "8px" }}>
                        {servicos.map((servico) => (
                          <span key={`${agendamento.id}-${servico}`} className="chip">{servico}</span>
                        ))}
                      </div>

                      {agendamento.status === "agendado" ? (
                        <div className="mt-5" style={{ display: "flex", justifyContent: "flex-end" }}>
                          <button
                            type="button"
                            className="btn btn--danger btn--sm"
                            onClick={() => cancelarAgendamento(agendamento.id)}
                            disabled={cancellingId === agendamento.id}
                          >
                            {cancellingId === agendamento.id ? "Cancelando..." : "Cancelar agendamento"}
                          </button>
                        </div>
                      ) : null}
                    </article>
                  );
                })
              )}
            </div>
          </section>

          <section className="card">
            <h2 className="card-title">Próximos agendamentos</h2>
            <p className="card-sub">Visão consolidada da barbearia.</p>

            <div className="stack stack-4 mt-6">
              {proximosFiltrados.length === 0 ? (
                <p className="muted">Nenhum próximo agendamento encontrado.</p>
              ) : (
                proximosFiltrados.map((agendamento) => {
                  const indicadores = obterIndicadores(agendamento);
                  const statusClass = statusClasses[agendamento.status] || "badge--gold";

                  return (
                    <article key={agendamento.id} className="card" style={{ boxShadow: "none", background: "var(--wood-700)" }}>
                      <div className="between wrap">
                        <div>
                          <p style={{ fontWeight: 600 }}>{agendamento.cliente?.nome || "Cliente"}</p>
                          <p className="faint" style={{ fontSize: "0.85rem" }}>Barbeiro: {agendamento.barbeiro?.nome || "Não informado"}</p>
                        </div>
                        <div className="row wrap" style={{ gap: "8px" }}>
                          <span className={`badge ${statusClass}`}>{agendamento.status}</span>
                          {indicadores.emAndamento ? <span className="badge badge--green">Em andamento</span> : null}
                          {indicadores.proximo ? <span className="badge badge--gold">Próximo</span> : null}
                        </div>
                      </div>

                      <p className="mt-4" style={{ fontWeight: 600 }}>{formatarDataHora(agendamento.data_hora_inicio)}</p>

                      {agendamento.status === "agendado" ? (
                        <div className="mt-5" style={{ display: "flex", justifyContent: "flex-end" }}>
                          <button
                            type="button"
                            className="btn btn--danger btn--sm"
                            onClick={() => cancelarAgendamento(agendamento.id)}
                            disabled={cancellingId === agendamento.id}
                          >
                            {cancellingId === agendamento.id ? "Cancelando..." : "Cancelar agendamento"}
                          </button>
                        </div>
                      ) : null}
                    </article>
                  );
                })
              )}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}