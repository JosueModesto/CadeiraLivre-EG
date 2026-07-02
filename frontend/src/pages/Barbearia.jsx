import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { barbeariaService } from "../services/barbeariaService";
import { barbeiroService } from "../services/barbeiroService";
import { servicoService } from "../services/servicoService";
import Navbar from "../components/Navbar";

const DIAS_SEMANA = [
  { value: 0, label: "Domingo" },
  { value: 1, label: "Segunda" },
  { value: 2, label: "Terça" },
  { value: 3, label: "Quarta" },
  { value: 4, label: "Quinta" },
  { value: 5, label: "Sexta" },
  { value: 6, label: "Sábado" },
];

const REGEX_SOMENTE_DIGITOS = /^\d+$/;
const REGEX_NOME_APENAS_LETRAS_ESPACOS = /^[A-Za-zÀ-ÖØ-öø-ÿ\s]+$/;

function validarTelefoneSomenteNumeros(valor) {
  return REGEX_SOMENTE_DIGITOS.test(String(valor || "").trim());
}

function validarNomeSemNumerosESimbolos(valor) {
  const nome = String(valor || "").trim();
  return nome.length >= 2 && REGEX_NOME_APENAS_LETRAS_ESPACOS.test(nome);
}

function disponibilidadeInicial() {
  return DIAS_SEMANA.reduce((acc, dia) => {
    acc[dia.value] = [{ hora_inicio: "08:00", hora_fim: "18:00", esta_disponivel: true }];
    return acc;
  }, {});
}

function funcionamentoInicial() {
  return DIAS_SEMANA.map((dia) => ({
    dia_semana: dia.value,
    esta_aberto: dia.value !== 0,
    hora_abertura: dia.value !== 0 ? "08:00" : "",
    hora_fechamento: dia.value !== 0 ? "18:00" : "",
  }));
}

function formatarMoeda(valor) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(Number(valor || 0));
}

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

export default function Barbearia() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [savingFuncionamento, setSavingFuncionamento] = useState(false);
  const [savingBarbeiro, setSavingBarbeiro] = useState(false);
  const [savingDisponibilidade, setSavingDisponibilidade] = useState(false);
  const [mostrarFuncionamento, setMostrarFuncionamento] = useState(false);
  const [mostrarDisponibilidade, setMostrarDisponibilidade] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [barbearia, setBarbearia] = useState(null);
  const [funcionamento, setFuncionamento] = useState(funcionamentoInicial());
  const [barbeiros, setBarbeiros] = useState([]);
  const [barbeiroSelecionadoId, setBarbeiroSelecionadoId] = useState("");
  const [disponibilidade, setDisponibilidade] = useState(disponibilidadeInicial());
  const [novoBarbeiro, setNovoBarbeiro] = useState({ nome: "", telefone: "", ativo: true });
  const [catalogoServicos, setCatalogoServicos] = useState([]);
  const [servicosBarbearia, setServicosBarbearia] = useState([]);
  const [novoServicoBaseId, setNovoServicoBaseId] = useState("");
  const [novoServicoPreco, setNovoServicoPreco] = useState("");
  const [adicionandoServico, setAdicionandoServico] = useState(false);
  const [salvandoPrecoServicoId, setSalvandoPrecoServicoId] = useState(null);
  const [removendoServicoId, setRemovendoServicoId] = useState(null);
  const [mostrarAdicionarServico, setMostrarAdicionarServico] = useState(false);

  useEffect(() => {
    async function carregar() {
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

        const [configResponse, barbeirosResponse, catalogoResponse, servicosResponse] = await Promise.all([
          barbeariaService.getAgendamentoConfig(encontrada.id),
          barbeiroService.getAll({ barbearia_id: encontrada.id }),
          servicoService.getAll({ global: true }),
          servicoService.getAll({ barbearia_id: encontrada.id }),
        ]);

        setCatalogoServicos(catalogoResponse.servicos || []);
        setServicosBarbearia(servicosResponse.servicos || []);

        const mapaFuncionamento = new Map((configResponse.funcionamento || []).map((item) => [item.dia_semana, item]));
        setFuncionamento(
          DIAS_SEMANA.map((dia) => {
            const atual = mapaFuncionamento.get(dia.value);
            return {
              dia_semana: dia.value,
              esta_aberto: atual ? Boolean(atual.esta_aberto) : false,
              hora_abertura: atual?.hora_abertura ? String(atual.hora_abertura).slice(0, 5) : "",
              hora_fechamento: atual?.hora_fechamento ? String(atual.hora_fechamento).slice(0, 5) : "",
            };
          })
        );

        const listaBarbeiros = barbeirosResponse.barbeiros || [];
        setBarbeiros(listaBarbeiros);
        if (listaBarbeiros.length > 0) {
          setBarbeiroSelecionadoId(String(listaBarbeiros[0].id));
        }
      } catch (err) {
        setError(err.response?.data?.message || "Erro ao carregar dados da barbearia.");
      } finally {
        setLoading(false);
      }
    }
    if (user?.id) carregar();
  }, [user?.id]);

  useEffect(() => {
    async function carregarDisponibilidade() {
      if (!barbeiroSelecionadoId) {
        setDisponibilidade(disponibilidadeInicial());
        return;
      }
      try {
        const response = await barbeiroService.getDisponibilidade(barbeiroSelecionadoId);
        const agrupado = {};
        DIAS_SEMANA.forEach((dia) => { agrupado[dia.value] = []; });

        (response.disponibilidades || []).forEach((item) => {
          const dia = Number(item.dia_semana);
          if (!agrupado[dia]) agrupado[dia] = [];
          agrupado[dia].push({
            hora_inicio: item.hora_inicio ? String(item.hora_inicio).slice(0, 5) : "08:00",
            hora_fim: item.hora_fim ? String(item.hora_fim).slice(0, 5) : "18:00",
            esta_disponivel: Boolean(item.esta_disponivel),
          });
        });

        DIAS_SEMANA.forEach((dia) => {
          if (agrupado[dia.value].length === 0) {
            agrupado[dia.value] = [{ hora_inicio: "08:00", hora_fim: "18:00", esta_disponivel: false }];
          }
        });

        setDisponibilidade(agrupado);
      } catch (err) {
        setError(err.response?.data?.message || "Erro ao carregar disponibilidade do barbeiro.");
      }
    }
    carregarDisponibilidade();
  }, [barbeiroSelecionadoId]);

  function atualizarFuncionamento(diaSemana, campo, valor) {
    setFuncionamento((current) =>
      current.map((item) => (item.dia_semana === diaSemana ? { ...item, [campo]: valor } : item))
    );
  }

  function atualizarIntervalo(diaSemana, index, campo, valor) {
    setDisponibilidade((current) => ({
      ...current,
      [diaSemana]: current[diaSemana].map((item, i) => (i === index ? { ...item, [campo]: valor } : item)),
    }));
  }

  function adicionarIntervalo(diaSemana) {
    setDisponibilidade((current) => ({
      ...current,
      [diaSemana]: [...current[diaSemana], { hora_inicio: "08:00", hora_fim: "18:00", esta_disponivel: true }],
    }));
  }

  function removerIntervalo(diaSemana, index) {
    setDisponibilidade((current) => ({
      ...current,
      [diaSemana]: current[diaSemana].filter((_, i) => i !== index),
    }));
  }

  const catalogoDisponivel = catalogoServicos.filter(
    (servico) => !servicosBarbearia.some((item) => item.nome_servico === servico.nome_servico)
  );

  async function salvarFuncionamento() {
    if (!barbearia) return;
    setSavingFuncionamento(true);
    setError("");
    setSuccess("");
    try {
      await barbeariaService.setFuncionamento(barbearia.id, { funcionamento });
      await barbeariaService.setIntervalo(barbearia.id, { intervalo_base: 60 });
      setSuccess("Funcionamento salvo com sucesso.");
    } catch (err) {
      setError(err.response?.data?.message || "Erro ao salvar funcionamento.");
    } finally {
      setSavingFuncionamento(false);
    }
  }

  async function criarBarbeiro(event) {
    event.preventDefault();
    if (!barbearia) return;

    if (!validarNomeSemNumerosESimbolos(novoBarbeiro.nome)) {
      setError("Nome do barbeiro deve conter apenas letras e espaços.");
      return;
    }

    if (!validarTelefoneSomenteNumeros(novoBarbeiro.telefone)) {
      setError("Telefone do barbeiro deve conter apenas números.");
      return;
    }

    setSavingBarbeiro(true);
    setError("");
    setSuccess("");
    try {
      const response = await barbeiroService.create({
        barbearia_id: barbearia.id,
        nome: novoBarbeiro.nome.trim(),
        telefone: novoBarbeiro.telefone.trim(),
        ativo: novoBarbeiro.ativo,
      });
      const item = response.barbeiro;
      setBarbeiros((current) => [...current, item]);
      setNovoBarbeiro({ nome: "", telefone: "", ativo: true });
      setBarbeiroSelecionadoId(String(item.id));
      setSuccess("Barbeiro criado com sucesso.");
    } catch (err) {
      setError(err.response?.data?.message || "Erro ao criar barbeiro.");
    } finally {
      setSavingBarbeiro(false);
    }
  }

  async function alternarAtivo(barbeiro) {
    setError("");
    setSuccess("");
    try {
      const response = await barbeiroService.update(barbeiro.id, { ativo: !barbeiro.ativo });
      const atualizado = response.barbeiro;
      setBarbeiros((current) => current.map((item) => (item.id === barbeiro.id ? atualizado : item)));
      setSuccess("Status do barbeiro atualizado.");
    } catch (err) {
      setError(err.response?.data?.message || "Erro ao atualizar barbeiro.");
    }
  }

  async function excluirBarbeiro(barbeiro) {
    if (!window.confirm(`Deseja realmente excluir o barbeiro ${barbeiro.nome}?`)) return;
    setError("");
    setSuccess("");
    try {
      await barbeiroService.remove(barbeiro.id);
      const listaAtualizada = barbeiros.filter((item) => item.id !== barbeiro.id);
      setBarbeiros(listaAtualizada);
      if (String(barbeiro.id) === barbeiroSelecionadoId) {
        setBarbeiroSelecionadoId(listaAtualizada.length > 0 ? String(listaAtualizada[0].id) : "");
      }
      if (listaAtualizada.length === 0) setDisponibilidade(disponibilidadeInicial());
      setSuccess("Barbeiro excluído com sucesso.");
    } catch (err) {
      setError(err.response?.data?.message || "Erro ao excluir barbeiro.");
    }
  }

  async function salvarDisponibilidade() {
    if (!barbeiroSelecionadoId) return;
    setSavingDisponibilidade(true);
    setError("");
    setSuccess("");
    try {
      const payload = {
        disponibilidades: DIAS_SEMANA.flatMap((dia) => {
          const intervalos = disponibilidade[dia.value] || [];
          if (intervalos.length === 0) return [{ dia_semana: dia.value, esta_disponivel: false }];
          return intervalos.map((item) => ({
            dia_semana: dia.value,
            esta_disponivel: Boolean(item.esta_disponivel),
            hora_inicio: item.hora_inicio,
            hora_fim: item.hora_fim,
          }));
        }),
      };
      await barbeiroService.setDisponibilidade(barbeiroSelecionadoId, payload);
      setSuccess("Disponibilidade do barbeiro salva com sucesso.");
    } catch (err) {
      setError(err.response?.data?.message || "Erro ao salvar disponibilidade do barbeiro.");
    } finally {
      setSavingDisponibilidade(false);
    }
  }

  async function adicionarServicoDaBarbearia(event) {
    event.preventDefault();

    if (!barbearia || !novoServicoBaseId || !novoServicoPreco) {
      setError("Selecione um serviço do catálogo e informe o preço.");
      return;
    }

    const preco = Number(novoServicoPreco);
    if (Number.isNaN(preco) || preco <= 0) {
      setError("Informe um preço válido.");
      return;
    }

    setAdicionandoServico(true);
    setError("");
    setSuccess("");

    try {
      const response = await servicoService.create({
        servico_id: Number(novoServicoBaseId),
        barbearia_id: barbearia.id,
        preco: preco.toFixed(2),
      });

      if (response.servico) {
        setServicosBarbearia((current) => [...current, response.servico]);
      }

      setNovoServicoBaseId("");
      setNovoServicoPreco("");
      setSuccess("Serviço adicionado à sua barbearia.");
    } catch (err) {
      setError(err.response?.data?.message || "Erro ao adicionar serviço à barbearia.");
    } finally {
      setAdicionandoServico(false);
    }
  }

  async function salvarPrecoServico(servico, novoPreco) {
    if (!novoPreco || Number(novoPreco) <= 0) {
      setError("Informe um preço válido para o serviço.");
      return;
    }

    setSalvandoPrecoServicoId(servico.id);
    setError("");
    setSuccess("");
    try {
      const response = await servicoService.update(servico.id, { preco: Number(novoPreco).toFixed(2) });
      setServicosBarbearia((current) => current.map((item) => (item.id === servico.id ? response.servico : item)));
      setSuccess("Preço atualizado com sucesso.");
    } catch (err) {
      setError(err.response?.data?.message || "Erro ao atualizar preço do serviço.");
    } finally {
      setSalvandoPrecoServicoId(null);
    }
  }

  async function removerServicoDaBarbearia(servico) {
    if (!window.confirm(`Deseja remover o serviço ${servico.nome_servico} da sua barbearia?`)) return;

    setRemovendoServicoId(servico.id);
    setError("");
    setSuccess("");
    try {
      await servicoService.remove(servico.id);
      setServicosBarbearia((current) => current.filter((item) => item.id !== servico.id));
      setSuccess("Serviço removido da barbearia.");
    } catch (err) {
      setError(err.response?.data?.message || "Erro ao remover serviço da barbearia.");
    } finally {
      setRemovendoServicoId(null);
    }
  }

  if (loading) {
    return (
      <div className="app-shell">
        <Navbar onBack={() => navigate("/dashboard")} />
        <main className="container page center">
          <div className="spinner" style={{ margin: "48px auto 16px" }} />
          <p className="muted">Carregando barbearia...</p>
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
        descricao="Cadastre uma barbearia antes de configurar funcionamento e disponibilidade."
        onVoltar={() => navigate("/dashboard")}
      />
    );
  }

  return (
    <div className="app-shell">
      <Navbar title="Minha barbearia" onBack={() => navigate("/dashboard")} />

      <main className="container page fade-in">
        <div className="between wrap" style={{ marginBottom: "24px" }}>
          <div>
            <h1 className="page-title">{barbearia.nome_comercial}</h1>
            <p className="muted mt-2">Configure funcionamento, barbeiros e disponibilidade.</p>
          </div>
          <button className="btn btn--ghost" onClick={() => navigate("/barbearia/agendamentos")}>
            Ver agenda
          </button>
        </div>

        {error ? <div className="alert alert--error" style={{ marginBottom: "16px" }}>{error}</div> : null}
        {success ? <div className="alert alert--success" style={{ marginBottom: "16px" }}>{success}</div> : null}

        <div className="grid grid-2" style={{ alignItems: "start" }}>
          <section className="stack stack-5">
            <section className="card">
              <button
                type="button"
                className="between"
                onClick={() => setMostrarFuncionamento((current) => !current)}
                aria-expanded={mostrarFuncionamento}
                style={{
                  width: "100%",
                  background: "none",
                  border: "none",
                  padding: 0,
                  color: "inherit",
                  cursor: "pointer",
                  textAlign: "left",
                  gap: "16px",
                }}
              >
                <div>
                  <h2 className="card-title">Funcionamento</h2>
                  <p className="card-sub">Janela principal de atendimento por dia.</p>
                </div>
                <span className="badge badge--gold">{mostrarFuncionamento ? "Ocultar" : "Ver"}</span>
              </button>

              {mostrarFuncionamento ? (
                <>
                  <div className="stack stack-4 mt-6">
                    {funcionamento.map((dia) => (
                      <div key={dia.dia_semana} className="card" style={{ padding: "16px", boxShadow: "none", background: "var(--wood-700)" }}>
                        <div className="between">
                          <p style={{ fontWeight: 600 }}>{DIAS_SEMANA.find((d) => d.value === dia.dia_semana)?.label}</p>
                          <label className="row" style={{ gap: "8px", fontSize: "0.85rem" }}>
                            <input
                              type="checkbox"
                              checked={dia.esta_aberto}
                              onChange={(e) => atualizarFuncionamento(dia.dia_semana, "esta_aberto", e.target.checked)}
                            />
                            Aberto
                          </label>
                        </div>
                        <div className="grid grid-2 mt-4">
                          <input
                            type="time"
                            value={dia.hora_abertura}
                            disabled={!dia.esta_aberto}
                            onChange={(e) => atualizarFuncionamento(dia.dia_semana, "hora_abertura", e.target.value)}
                          />
                          <input
                            type="time"
                            value={dia.hora_fechamento}
                            disabled={!dia.esta_aberto}
                            onChange={(e) => atualizarFuncionamento(dia.dia_semana, "hora_fechamento", e.target.value)}
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  <button className="btn btn--primary btn--block mt-6" onClick={salvarFuncionamento} disabled={savingFuncionamento}>
                    {savingFuncionamento ? "Salvando..." : "Salvar funcionamento"}
                  </button>
                </>
              ) : null}
            </section>

            <section className="card">
              <button
                type="button"
                className="between"
                onClick={() => setMostrarDisponibilidade((current) => !current)}
                aria-expanded={mostrarDisponibilidade}
                style={{
                  width: "100%",
                  background: "none",
                  border: "none",
                  padding: 0,
                  color: "inherit",
                  cursor: "pointer",
                  textAlign: "left",
                  gap: "16px",
                }}
              >
                <div>
                  <h2 className="card-title">Disponibilidade do barbeiro</h2>
                  <p className="card-sub">
                    {barbeiroSelecionadoId
                      ? "Defina os intervalos em que o barbeiro selecionado aceita agendamentos."
                      : "Selecione um barbeiro ao lado para configurar a disponibilidade."}
                  </p>
                </div>
                <span className="badge badge--gold">{mostrarDisponibilidade ? "Ocultar" : "Ver"}</span>
              </button>

              {mostrarDisponibilidade ? (
                <>
                  <div className="stack stack-4 mt-6">
                    {DIAS_SEMANA.map((dia) => (
                      <div key={dia.value} className="card" style={{ padding: "16px", boxShadow: "none", background: "var(--wood-700)" }}>
                        <div className="between">
                          <h3 style={{ fontSize: "0.95rem" }}>{dia.label}</h3>
                          <button onClick={() => adicionarIntervalo(dia.value)} className="btn btn--ghost btn--sm">
                            + intervalo
                          </button>
                        </div>
                        <div className="stack stack-4 mt-4">
                          {(disponibilidade[dia.value] || []).map((intervalo, index) => (
                            <div
                              key={`${dia.value}-${index}`}
                              className="grid"
                              style={{ gridTemplateColumns: "auto 1fr 1fr auto", gap: "10px", alignItems: "center" }}
                            >
                              <label className="row" style={{ gap: "6px", fontSize: "0.8rem" }}>
                                <input
                                  type="checkbox"
                                  checked={intervalo.esta_disponivel}
                                  onChange={(e) => atualizarIntervalo(dia.value, index, "esta_disponivel", e.target.checked)}
                                />
                                Disp.
                              </label>
                              <input
                                type="time"
                                value={intervalo.hora_inicio}
                                disabled={!intervalo.esta_disponivel}
                                onChange={(e) => atualizarIntervalo(dia.value, index, "hora_inicio", e.target.value)}
                              />
                              <input
                                type="time"
                                value={intervalo.hora_fim}
                                disabled={!intervalo.esta_disponivel}
                                onChange={(e) => atualizarIntervalo(dia.value, index, "hora_fim", e.target.value)}
                              />
                              {(disponibilidade[dia.value] || []).length > 1 ? (
                                <button onClick={() => removerIntervalo(dia.value, index)} className="btn btn--danger btn--sm">
                                  ✕
                                </button>
                              ) : (
                                <span />
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  <button
                    className="btn btn--primary btn--block mt-6"
                    onClick={salvarDisponibilidade}
                    disabled={!barbeiroSelecionadoId || savingDisponibilidade}
                  >
                    {savingDisponibilidade ? "Salvando..." : "Salvar disponibilidade"}
                  </button>
                </>
              ) : null}
            </section>
          </section>

          <section className="stack stack-5">
            <div className="card">
              <h2 className="card-title">Barbeiros</h2>
              <p className="card-sub">Adicione, ative/desative ou remova barbeiros.</p>

              <form onSubmit={criarBarbeiro} className="grid mt-6" style={{ gridTemplateColumns: "1.2fr 1fr auto", gap: "10px" }}>
                <input
                  value={novoBarbeiro.nome}
                  onChange={(e) => setNovoBarbeiro((c) => ({ ...c, nome: e.target.value }))}
                  placeholder="Nome do barbeiro"
                />
                <input
                  type="tel"
                  value={novoBarbeiro.telefone}
                  onChange={(e) => setNovoBarbeiro((c) => ({ ...c, telefone: e.target.value }))}
                  placeholder="Ex.: 44999990000"
                  inputMode="numeric"
                  pattern="[0-9]*"
                />
                <button type="submit" className="btn btn--primary" disabled={savingBarbeiro}>
                  {savingBarbeiro ? "..." : "Adicionar"}
                </button>
              </form>

              <div className="stack stack-4 mt-6">
                {barbeiros.length === 0 ? (
                  <p className="muted" style={{ fontSize: "0.88rem" }}>Nenhum barbeiro cadastrado ainda.</p>
                ) : (
                  barbeiros.map((barbeiro) => (
                    <div
                      key={barbeiro.id}
                      className="between wrap card"
                      style={{
                        padding: "14px 16px",
                        boxShadow: "none",
                        background: "var(--wood-700)",
                        borderColor: String(barbeiro.id) === barbeiroSelecionadoId ? "var(--gold-deep)" : "var(--line)",
                      }}
                    >
                      <button
                        onClick={() => setBarbeiroSelecionadoId(String(barbeiro.id))}
                        style={{ background: "none", border: "none", textAlign: "left", cursor: "pointer", color: "inherit" }}
                      >
                        <p style={{ fontWeight: 600, color: String(barbeiro.id) === barbeiroSelecionadoId ? "var(--gold)" : "var(--cream)" }}>
                          {barbeiro.nome}
                        </p>
                        <p className="faint" style={{ fontSize: "0.8rem" }}>{barbeiro.telefone || "sem telefone"}</p>
                      </button>
                      <div className="row" style={{ gap: "8px" }}>
                        <button
                          onClick={() => alternarAtivo(barbeiro)}
                          className={`badge ${barbeiro.ativo ? "badge--green" : "badge--red"}`}
                          style={{ cursor: "pointer" }}
                        >
                          {barbeiro.ativo ? "Ativo" : "Inativo"}
                        </button>
                        <button onClick={() => excluirBarbeiro(barbeiro)} className="btn btn--danger btn--sm">
                          Excluir
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="card">
              <div className="between wrap">
                <div>
                  <h2 className="card-title">Serviços da minha barbearia</h2>
                  <p className="card-sub">Ajuste o preço dos serviços que você oferece ou remova da sua loja.</p>
                </div>
                <button
                  type="button"
                  className="btn btn--ghost btn--sm"
                  onClick={() => setMostrarAdicionarServico((current) => !current)}
                  disabled={catalogoDisponivel.length === 0}
                >
                  {mostrarAdicionarServico ? "Fechar" : "+ Adicionar serviço"}
                </button>
              </div>

              {mostrarAdicionarServico ? (
                <form onSubmit={adicionarServicoDaBarbearia} className="grid mt-6" style={{ gridTemplateColumns: "1.4fr 1fr auto", gap: "10px" }}>
                  <select value={novoServicoBaseId} onChange={(e) => setNovoServicoBaseId(e.target.value)}>
                    <option value="">Selecione um serviço</option>
                    {catalogoDisponivel.map((servico) => (
                      <option key={servico.id} value={servico.id}>
                        {servico.nome_servico} - {servico.duracao_min} min - {formatarMoeda(servico.preco)}
                      </option>
                    ))}
                  </select>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={novoServicoPreco}
                    onChange={(e) => setNovoServicoPreco(e.target.value)}
                    placeholder="Preço na sua loja"
                  />
                  <button type="submit" className="btn btn--primary" disabled={adicionandoServico || catalogoDisponivel.length === 0}>
                    {adicionandoServico ? "Adicionando..." : "Adicionar"}
                  </button>
                </form>
              ) : null}

              <div className="stack stack-4 mt-6">
                {servicosBarbearia.length === 0 ? (
                  <p className="muted" style={{ fontSize: "0.88rem" }}>Nenhum serviço adicionado à sua barbearia ainda.</p>
                ) : (
                  servicosBarbearia.map((servico) => (
                    <ServicoBarbeariaCard
                      key={servico.id}
                      servico={servico}
                      salvando={salvandoPrecoServicoId === servico.id}
                      removendo={removendoServicoId === servico.id}
                      onSalvarPreco={(preco) => salvarPrecoServico(servico, preco)}
                      onRemover={() => removerServicoDaBarbearia(servico)}
                    />
                  ))
                )}
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

function ServicoBarbeariaCard({ servico, onSalvarPreco, onRemover, salvando, removendo }) {
  const [preco, setPreco] = useState(String(servico.preco ?? ""));
  const alterado = Number(preco) !== Number(servico.preco);

  useEffect(() => {
    setPreco(String(servico.preco ?? ""));
  }, [servico.preco]);

  return (
    <div className="card" style={{ padding: "14px 16px", boxShadow: "none", background: "var(--wood-700)" }}>
      <div className="between wrap">
        <div>
          <p style={{ fontWeight: 600 }}>{servico.nome_servico}</p>
          <p className="faint" style={{ fontSize: "0.8rem" }}>{servico.duracao_min} min</p>
        </div>
        <span className="badge badge--gold">Preço da sua loja</span>
      </div>

      <div className="row mt-4" style={{ gap: "8px", justifyContent: "flex-end" }}>
        <div className="field" style={{ width: "140px" }}>
          <label style={{ fontSize: "0.66rem" }}>Preço</label>
          <input type="number" min="0" step="0.01" value={preco} onChange={(e) => setPreco(e.target.value)} />
        </div>
        <button type="button" className="btn btn--ghost btn--sm" disabled={!alterado || salvando} onClick={() => onSalvarPreco(preco)}>
          {salvando ? "Salvando..." : "Salvar"}
        </button>
        <button type="button" className="btn btn--danger btn--sm" onClick={onRemover} disabled={removendo}>
          {removendo ? "Removendo..." : "Remover"}
        </button>
      </div>
    </div>
  );
}
