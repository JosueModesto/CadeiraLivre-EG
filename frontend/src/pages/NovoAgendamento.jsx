import { useEffect, useState } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { agendamentoService } from "../services/agendamentoService";
import { barbeariaService } from "../services/barbeariaService";
import { barbeiroService } from "../services/barbeiroService";
import { servicoService } from "../services/servicoService";
import Navbar from "../components/Navbar";

function formatarHorario(valor) {
  return new Intl.DateTimeFormat("pt-BR", { timeStyle: "short" }).format(new Date(valor));
}

function formatarMoeda(valor) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(Number(valor || 0));
}

export default function NovoAgendamento() {
  const { barbeariaId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [barbeariaSelecionada, setBarbeariaSelecionada] = useState(null);
  const [barbeiros, setBarbeiros] = useState([]);
  const [servicos, setServicos] = useState([]);
  const [horarios, setHorarios] = useState([]);
  const [loadingInicial, setLoadingInicial] = useState(true);
  const [loadingHorarios, setLoadingHorarios] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [form, setForm] = useState({
    barbearia_id: barbeariaId || "",
    barbeiro_id: "",
    data: "",
    servico_ids: [],
    data_hora_inicio: "",
  });

  useEffect(() => {
    async function carregarDadosIniciais() {
      if (!barbeariaId) {
        setError("Barbearia não informada para o agendamento.");
        setLoadingInicial(false);
        return;
      }

      setLoadingInicial(true);
      setError("");

      try {
        const [barbeariaResponse, barbeirosResponse, servicosResponse] = await Promise.all([
          barbeariaService.getById(barbeariaId),
          barbeiroService.getAll({ barbearia_id: barbeariaId }),
          servicoService.getAll({ barbearia_id: barbeariaId }),
        ]);

        setBarbeariaSelecionada(barbeariaResponse.barbearia || null);
        setBarbeiros((barbeirosResponse.barbeiros || []).filter((item) => item.ativo));
        setServicos(servicosResponse.servicos || []);
        setForm((current) => ({ ...current, barbearia_id: String(barbeariaId) }));
      } catch (err) {
        setError(err.response?.data?.message || "Erro ao carregar dados da barbearia.");
      } finally {
        setLoadingInicial(false);
      }
    }

    carregarDadosIniciais();
  }, [barbeariaId]);

  useEffect(() => {
    async function carregarHorarios() {
      if (!form.barbearia_id || !form.barbeiro_id || !form.data) {
        setHorarios([]);
        return;
      }

      setLoadingHorarios(true);
      setError("");

      try {
        const response = await agendamentoService.getAvailableSlots({
          barbearia_id: form.barbearia_id,
          barbeiro_id: form.barbeiro_id,
          data: form.data,
        });

        setHorarios(response.horarios || []);
        setForm((current) => ({
          ...current,
          data_hora_inicio: (response.horarios || []).includes(current.data_hora_inicio)
            ? current.data_hora_inicio
            : "",
        }));
      } catch (err) {
        setHorarios([]);
        setError(err.response?.data?.message || "Erro ao buscar horários disponíveis.");
      } finally {
        setLoadingHorarios(false);
      }
    }

    carregarHorarios();
  }, [form.barbearia_id, form.barbeiro_id, form.data]);

  function atualizarCampo(campo, valor) {
    setForm((current) => ({ ...current, [campo]: valor }));
    setError("");
    setSuccess("");
  }

  function alternarServico(servicoId) {
    setForm((current) => {
      const existe = current.servico_ids.includes(servicoId);
      return {
        ...current,
        servico_ids: existe
          ? current.servico_ids.filter((id) => id !== servicoId)
          : [...current.servico_ids, servicoId],
      };
    });
    setError("");
    setSuccess("");
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!form.barbearia_id || !form.barbeiro_id || !form.data || !form.data_hora_inicio || form.servico_ids.length === 0) {
      setError("Selecione barbeiro, data, horário e ao menos um serviço.");
      return;
    }

    setSubmitting(true);

    try {
      const disponibilidade = await agendamentoService.checkAvailability({
        barbearia_id: form.barbearia_id,
        barbeiro_id: form.barbeiro_id,
        data_hora_inicio: form.data_hora_inicio,
      });

      if (!disponibilidade.disponivel) {
        setError("Esse horário acabou de ser ocupado. Escolha outro horário.");
        return;
      }

      const response = await agendamentoService.create({
        barbearia_id: Number(form.barbearia_id),
        barbeiro_id: Number(form.barbeiro_id),
        servico_ids: form.servico_ids,
        data_hora_inicio: form.data_hora_inicio,
      });

      setSuccess(response.message || "Agendamento realizado com sucesso.");
      setTimeout(() => navigate("/agendamentos"), 900);
    } catch (err) {
      setError(err.response?.data?.message || "Erro ao criar agendamento.");
    } finally {
      setSubmitting(false);
    }
  }

  const barbeiroSelecionado = barbeiros.find((item) => String(item.id) === String(form.barbeiro_id));
  const valorTotal = servicos
    .filter((servico) => form.servico_ids.includes(servico.id))
    .reduce((total, servico) => total + Number(servico.preco), 0);

  if (user?.tipo_usuario === "barbearia") {
    return <Navigate to="/dashboard" replace />;
  }

  if (!barbeariaId) {
    return <Navigate to="/novo-agendamento" replace />;
  }

  return (
    <div className="app-shell">
      <Navbar title="Novo agendamento" onBack={() => navigate("/novo-agendamento")} />

      <main className="container page fade-in">
        <h1 className="page-title">Reserve seu horário</h1>
        <p className="muted mt-2">Escolha barbeiro, serviços e horário para a barbearia selecionada.</p>

        <div className="grid mt-6" style={{ gridTemplateColumns: "minmax(0, 1.4fr) minmax(0, 0.9fr)" }}>
          <section className="card">
            {loadingInicial ? (
              <div className="center" style={{ padding: "24px" }}>
                <div className="spinner" style={{ margin: "0 auto 16px" }} />
                <p className="muted">Carregando dados...</p>
              </div>
            ) : (
              <>
                <div className="between" style={{ gap: "12px", alignItems: "center" }}>
                  <div>
                    <p className="section-label">Barbearia selecionada</p>
                    <p className="mt-2" style={{ fontWeight: 700 }}>{barbeariaSelecionada?.nome_comercial || "—"}</p>
                    <p className="faint mt-2" style={{ fontSize: "0.82rem" }}>{barbeariaSelecionada?.endereco || ""}</p>
                  </div>
                  <button type="button" className="btn btn--ghost btn--sm" onClick={() => navigate("/novo-agendamento")}>Trocar</button>
                </div>

                <form onSubmit={handleSubmit} className="stack stack-5 mt-5">
                  <div className="field">
                    <label>Barbeiro</label>
                    <select
                      value={form.barbeiro_id}
                      onChange={(event) => atualizarCampo("barbeiro_id", event.target.value)}
                      disabled={!form.barbearia_id}
                    >
                      <option value="">Selecione</option>
                      {barbeiros.map((barbeiro) => (
                        <option key={barbeiro.id} value={barbeiro.id}>{barbeiro.nome}</option>
                      ))}
                    </select>
                  </div>

                  <div className="field">
                    <label>Data</label>
                    <input
                      type="date"
                      value={form.data}
                      min={new Date().toISOString().slice(0, 10)}
                      onChange={(event) => atualizarCampo("data", event.target.value)}
                      disabled={!form.barbearia_id || !form.barbeiro_id}
                    />
                  </div>

                  <div>
                    <div className="between" style={{ marginBottom: "12px" }}>
                      <span className="field-label">Serviços</span>
                      <span className="faint" style={{ fontSize: "0.8rem" }}>Selecione um ou mais</span>
                    </div>
                    {servicos.length === 0 ? (
                      <p className="muted" style={{ fontSize: "0.88rem" }}>Nenhum serviço disponível para esta barbearia.</p>
                    ) : (
                      <div className="grid grid-2">
                        {servicos.map((servico) => {
                          const ativo = form.servico_ids.includes(servico.id);
                          return (
                            <button
                              key={servico.id}
                              type="button"
                              onClick={() => alternarServico(servico.id)}
                              className="card"
                              style={{
                                padding: "16px",
                                textAlign: "left",
                                cursor: "pointer",
                                borderColor: ativo ? "var(--gold)" : "var(--line)",
                                background: ativo ? "rgba(201, 162, 76, 0.1)" : "var(--wood-700)",
                                boxShadow: "none",
                              }}
                            >
                              <div className="between">
                                <div>
                                  <p style={{ fontWeight: 600 }}>{servico.nome_servico}</p>
                                  <p className="faint mt-2" style={{ fontSize: "0.8rem" }}>{servico.duracao_min} min</p>
                                </div>
                                <span className="chip">{formatarMoeda(servico.preco)}</span>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  <div>
                    <div className="between" style={{ marginBottom: "12px" }}>
                      <span className="field-label">Horários disponíveis</span>
                      {loadingHorarios ? <span className="faint" style={{ fontSize: "0.8rem" }}>Consultando...</span> : null}
                    </div>
                    {!form.data ? (
                      <p className="muted" style={{ fontSize: "0.88rem" }}>Selecione a data para ver os horários.</p>
                    ) : horarios.length === 0 ? (
                      <p className="muted" style={{ fontSize: "0.88rem" }}>Nenhum horário disponível para os filtros selecionados.</p>
                    ) : (
                      <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(90px, 1fr))", gap: "10px" }}>
                        {horarios.map((horario) => {
                          const ativo = form.data_hora_inicio === horario;
                          return (
                            <button
                              key={horario}
                              type="button"
                              onClick={() => atualizarCampo("data_hora_inicio", horario)}
                              className={ativo ? "btn btn--primary" : "btn btn--ghost"}
                            >
                              {formatarHorario(horario)}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {error ? <div className="alert alert--error">{error}</div> : null}
                  {success ? <div className="alert alert--success">{success}</div> : null}

                  <button type="submit" className="btn btn--primary btn--block" disabled={submitting}>
                    {submitting ? "Confirmando..." : "Confirmar agendamento"}
                  </button>
                </form>
              </>
            )}
          </section>

          <aside className="stack stack-5">
            <section className="card">
              <div className="section-label">Resumo</div>
              <div className="stack stack-4 mt-4">
                <div>
                  <p className="faint" style={{ fontSize: "0.78rem" }}>Barbearia</p>
                  <p className="mt-2" style={{ fontWeight: 600 }}>{barbeariaSelecionada?.nome_comercial || "—"}</p>
                </div>
                <div>
                  <p className="faint" style={{ fontSize: "0.78rem" }}>Barbeiro</p>
                  <p className="mt-2" style={{ fontWeight: 600 }}>{barbeiroSelecionado?.nome || "—"}</p>
                </div>
                <div>
                  <p className="faint" style={{ fontSize: "0.78rem" }}>Data</p>
                  <p className="mt-2" style={{ fontWeight: 600 }}>{form.data || "—"}</p>
                </div>
                <div>
                  <p className="faint" style={{ fontSize: "0.78rem" }}>Horário</p>
                  <p className="mt-2" style={{ fontWeight: 600 }}>
                    {form.data_hora_inicio ? formatarHorario(form.data_hora_inicio) : "—"}
                  </p>
                </div>
                <div style={{ borderTop: "1px solid var(--line)", paddingTop: "16px" }}>
                  <p className="faint" style={{ fontSize: "0.78rem" }}>Valor estimado</p>
                  <p className="gold mt-2" style={{ fontWeight: 700, fontSize: "1.6rem" }}>{formatarMoeda(valorTotal)}</p>
                </div>
              </div>
            </section>

            <section className="card">
              <div className="section-label">Como funciona</div>
              <ul className="muted mt-4" style={{ paddingLeft: "18px", fontSize: "0.86rem", lineHeight: 1.7 }}>
                <li>Os horários respeitam o funcionamento da barbearia.</li>
                <li>E também a disponibilidade do barbeiro.</li>
                <li>Cada reserva ocupa um bloco fixo de 60 minutos.</li>
                <li>Horários já ocupados não aparecem na lista.</li>
              </ul>
            </section>
          </aside>
        </div>
      </main>
    </div>
  );
}
