import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";
import { cidadeService } from "../services/cidadeService";
import { servicoService } from "../services/servicoService";

function normalizarEstado(valor) {
  return String(valor || "").trim().toUpperCase();
}

function cidadeVazia() {
  return { nome: "", estado: "" };
}

function servicoVazio() {
  return { nome_servico: "", preco: "", duracao_min: "" };
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [cidades, setCidades] = useState([]);
  const [servicos, setServicos] = useState([]);
  const [cidadeForm, setCidadeForm] = useState(cidadeVazia());
  const [servicoForm, setServicoForm] = useState(servicoVazio());
  const [cidadeEditandoId, setCidadeEditandoId] = useState(null);
  const [servicoEditandoId, setServicoEditandoId] = useState(null);
  const [salvandoCidadeId, setSalvandoCidadeId] = useState(null);
  const [salvandoServicoId, setSalvandoServicoId] = useState(null);
  const [excluindoCidadeId, setExcluindoCidadeId] = useState(null);
  const [excluindoServicoId, setExcluindoServicoId] = useState(null);

  useEffect(() => {
    async function carregarDados() {
      setLoading(true);
      setError("");

      try {
        const [cidadesResponse, servicosResponse] = await Promise.all([
          cidadeService.getAll(),
          servicoService.getAll({ global: true }),
        ]);

        setCidades(cidadesResponse.cidades || []);
        setServicos(servicosResponse.servicos || []);
      } catch (err) {
        setError(err.response?.data?.message || "Erro ao carregar os dados do administrador.");
      } finally {
        setLoading(false);
      }
    }

    carregarDados();
  }, []);

  function limparMensagens() {
    setError("");
    setSuccess("");
  }

  function iniciarEdicaoCidade(cidade) {
    limparMensagens();
    setCidadeEditandoId(cidade.id);
    setCidadeForm({
      nome: cidade.nome || "",
      estado: cidade.estado || "",
    });
  }

  function cancelarEdicaoCidade() {
    setCidadeEditandoId(null);
    setCidadeForm(cidadeVazia());
  }

  function iniciarEdicaoServico(servico) {
    limparMensagens();
    setServicoEditandoId(servico.id);
    setServicoForm({
      nome_servico: servico.nome_servico || "",
      preco: String(servico.preco ?? ""),
      duracao_min: String(servico.duracao_min ?? ""),
    });
  }

  function cancelarEdicaoServico() {
    setServicoEditandoId(null);
    setServicoForm(servicoVazio());
  }

  async function salvarCidade(event) {
    event.preventDefault();

    if (!cidadeForm.nome.trim() || !cidadeForm.estado.trim()) {
      setError("Preencha nome e estado da cidade.");
      return;
    }

    setSalvandoCidadeId(cidadeEditandoId || "nova");
    limparMensagens();

    try {
      if (cidadeEditandoId) {
        const response = await cidadeService.update(cidadeEditandoId, {
          nome: cidadeForm.nome.trim(),
          estado: normalizarEstado(cidadeForm.estado),
        });

        setCidades((current) => current.map((item) => (item.id === cidadeEditandoId ? response.cidade : item)));
        setSuccess("Cidade atualizada com sucesso.");
      } else {
        const response = await cidadeService.create({
          nome: cidadeForm.nome.trim(),
          estado: normalizarEstado(cidadeForm.estado),
        });

        if (response.cidade) {
          setCidades((current) => [...current, response.cidade]);
        }
        setSuccess("Cidade criada com sucesso.");
      }

      cancelarEdicaoCidade();
    } catch (err) {
      setError(err.response?.data?.message || "Não foi possível salvar a cidade.");
    } finally {
      setSalvandoCidadeId(null);
    }
  }

  async function excluirCidade(cidade) {
    const confirmar = window.confirm(`Deseja realmente excluir a cidade ${cidade.nome}?`);
    if (!confirmar) return;

    setExcluindoCidadeId(cidade.id);
    limparMensagens();

    try {
      await cidadeService.remove(cidade.id);
      setCidades((current) => current.filter((item) => item.id !== cidade.id));
      if (cidadeEditandoId === cidade.id) {
        cancelarEdicaoCidade();
      }
      setSuccess("Cidade excluída com sucesso.");
    } catch (err) {
      setError(err.response?.data?.message || "Não foi possível excluir a cidade.");
    } finally {
      setExcluindoCidadeId(null);
    }
  }

  async function salvarServico(event) {
    event.preventDefault();

    if (!servicoForm.nome_servico.trim() || !servicoForm.preco || !servicoForm.duracao_min) {
      setError("Preencha nome, preço e duração do serviço.");
      return;
    }

    const preco = Number(servicoForm.preco);
    const duracaoMin = Number(servicoForm.duracao_min);

    if (Number.isNaN(preco) || preco <= 0 || Number.isNaN(duracaoMin) || duracaoMin <= 0) {
      setError("Informe preço e duração válidos.");
      return;
    }

    setSalvandoServicoId(servicoEditandoId || "novo");
    limparMensagens();

    try {
      if (servicoEditandoId) {
        const response = await servicoService.update(servicoEditandoId, {
          nome_servico: servicoForm.nome_servico.trim(),
          preco,
          duracao_min: duracaoMin,
        });

        setServicos((current) => current.map((item) => (item.id === servicoEditandoId ? response.servico : item)));
        setSuccess("Serviço atualizado com sucesso.");
      } else {
        const response = await servicoService.create({
          nome_servico: servicoForm.nome_servico.trim(),
          preco,
          duracao_min: duracaoMin,
        });

        if (response.servico) {
          setServicos((current) => [...current, response.servico]);
        }
        setSuccess("Serviço criado com sucesso.");
      }

      cancelarEdicaoServico();
    } catch (err) {
      setError(err.response?.data?.message || "Não foi possível salvar o serviço.");
    } finally {
      setSalvandoServicoId(null);
    }
  }

  async function excluirServico(servico) {
    const confirmar = window.confirm(`Deseja realmente excluir o serviço ${servico.nome_servico}?`);
    if (!confirmar) return;

    setExcluindoServicoId(servico.id);
    limparMensagens();

    try {
      await servicoService.remove(servico.id);
      setServicos((current) => current.filter((item) => item.id !== servico.id));
      if (servicoEditandoId === servico.id) {
        cancelarEdicaoServico();
      }
      setSuccess("Serviço excluído com sucesso.");
    } catch (err) {
      setError(err.response?.data?.message || "Não foi possível excluir o serviço.");
    } finally {
      setExcluindoServicoId(null);
    }
  }

  const salvandoCidade = salvandoCidadeId !== null;
  const salvandoServico = salvandoServicoId !== null;

  if (loading) {
    return (
      <div className="app-shell">
        <Navbar title="Painel do administrador" />
        <main className="container page center">
          <div className="spinner" style={{ margin: "48px auto 16px" }} />
          <p className="muted">Carregando painel administrativo...</p>
        </main>
      </div>
    );
  }

  if (user?.tipo_usuario !== "administrador") {
    return (
      <div className="app-shell">
        <Navbar title="Acesso restrito" />
        <main className="container page">
          <div className="card empty">
            <h1 className="card-title">Tela exclusiva do administrador</h1>
            <p className="muted mt-2">Você não tem permissão para acessar o gerenciamento de cidades e serviços.</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <Navbar title="Painel do administrador" />

      <main className="container page fade-in">
        <div className="card" style={{ background: "linear-gradient(180deg, var(--wood-800), var(--wood-700))" }}>
          <div className="section-label">Administração</div>
          <h1 className="page-title mt-2">Bem-vindo, <span className="accent">{user?.nome || "administrador"}</span></h1>
          <p className="muted mt-2">Gerencie as cidades do sistema e o catálogo de serviços global.</p>

          <div className="grid grid-3 mt-6">
            <InfoCard label="Cidades" value={cidades.length} />
            <InfoCard label="Serviços" value={servicos.length} />
            <InfoCard label="Catálogo" value="Global" />
          </div>
        </div>

        {error ? <div className="alert alert--error mt-4">{error}</div> : null}
        {success ? <div className="alert alert--success mt-4">{success}</div> : null}

        <div className="grid grid-2 mt-6" style={{ alignItems: "start" }}>
          <section className="stack stack-5">
            <div className="card">
              <div className="between wrap">
                <div>
                  <h2 className="card-title">Cidades</h2>
                  <p className="card-sub">Crie, edite e remova cidades cadastradas no sistema.</p>
                </div>
                <span className="badge badge--gold">{cidadeEditandoId ? "Editando" : "Nova cidade"}</span>
              </div>

              <form onSubmit={salvarCidade} className="grid grid-2 mt-6">
                <div className="field">
                  <label>Nome da cidade</label>
                  <input
                    value={cidadeForm.nome}
                    onChange={(event) => setCidadeForm((current) => ({ ...current, nome: event.target.value }))}
                    placeholder="Ex.: São Paulo"
                  />
                </div>

                <div className="field">
                  <label>Estado</label>
                  <input
                    value={cidadeForm.estado}
                    onChange={(event) => setCidadeForm((current) => ({ ...current, estado: event.target.value }))}
                    placeholder="Ex.: SP"
                    maxLength={2}
                  />
                </div>

                <div className="row mt-2" style={{ gridColumn: "1 / -1", justifyContent: "flex-end" }}>
                  {cidadeEditandoId ? (
                    <button type="button" className="btn btn--ghost" onClick={cancelarEdicaoCidade} disabled={salvandoCidade}>
                      Cancelar
                    </button>
                  ) : null}
                  <button type="submit" className="btn btn--primary" disabled={salvandoCidade}>
                    {salvandoCidade
                      ? "Salvando..."
                      : cidadeEditandoId
                        ? "Salvar alterações"
                        : "Criar cidade"}
                  </button>
                </div>
              </form>
            </div>

            <div className="stack stack-4">
              {cidades.length === 0 ? (
                <div className="card empty">
                  <p className="muted">Nenhuma cidade cadastrada ainda.</p>
                </div>
              ) : (
                cidades.map((cidade) => (
                  <article key={cidade.id} className="card" style={{ padding: "18px" }}>
                    <div className="between wrap">
                      <div>
                        <h3 className="card-title" style={{ fontSize: "1rem" }}>{cidade.nome}</h3>
                        <p className="card-sub">Estado: {cidade.estado}</p>
                      </div>
                      <div className="row wrap" style={{ justifyContent: "flex-end" }}>
                        <button type="button" className="btn btn--ghost btn--sm" onClick={() => iniciarEdicaoCidade(cidade)}>
                          Editar
                        </button>
                        <button
                          type="button"
                          className="btn btn--danger btn--sm"
                          onClick={() => excluirCidade(cidade)}
                          disabled={excluindoCidadeId === cidade.id}
                        >
                          {excluindoCidadeId === cidade.id ? "Excluindo..." : "Excluir"}
                        </button>
                      </div>
                    </div>
                  </article>
                ))
              )}
            </div>
          </section>

          <section className="stack stack-5">
            <div className="card">
              <div className="between wrap">
                <div>
                  <h2 className="card-title">Serviços</h2>
                  <p className="card-sub">Cadastre serviços base sem preço. A barbearia define o valor ao oferecer o serviço.</p>
                </div>
                <span className="badge badge--gold">{servicoEditandoId ? "Editando" : "Novo serviço"}</span>
              </div>

              <form onSubmit={salvarServico} className="grid grid-2 mt-6">
                <div className="field" style={{ gridColumn: "1 / -1" }}>
                  <label>Nome do serviço</label>
                  <input
                    value={servicoForm.nome_servico}
                    onChange={(event) => setServicoForm((current) => ({ ...current, nome_servico: event.target.value }))}
                    placeholder="Ex.: Corte masculino"
                  />
                </div>

                <div className="field">
                  <label>Preço base</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={servicoForm.preco}
                    onChange={(event) => setServicoForm((current) => ({ ...current, preco: event.target.value }))}
                    placeholder="0,00"
                  />
                </div>

                <div className="field">
                  <label>Duração em minutos</label>
                  <input
                    type="number"
                    min="1"
                    step="1"
                    value={servicoForm.duracao_min}
                    onChange={(event) => setServicoForm((current) => ({ ...current, duracao_min: event.target.value }))}
                    placeholder="30"
                  />
                </div>

                <div className="row mt-2" style={{ gridColumn: "1 / -1", justifyContent: "flex-end" }}>
                  {servicoEditandoId ? (
                    <button type="button" className="btn btn--ghost" onClick={cancelarEdicaoServico} disabled={salvandoServico}>
                      Cancelar
                    </button>
                  ) : null}
                  <button type="submit" className="btn btn--primary" disabled={salvandoServico}>
                    {salvandoServico
                      ? "Salvando..."
                      : servicoEditandoId
                        ? "Salvar alterações"
                        : "Criar serviço"}
                  </button>
                </div>
              </form>
            </div>

            <div className="stack stack-4">
              {servicos.length === 0 ? (
                <div className="card empty">
                  <p className="muted">Nenhum serviço cadastrado ainda.</p>
                </div>
              ) : (
                servicos.map((servico) => (
                  <article key={servico.id} className="card" style={{ padding: "18px" }}>
                    <div className="between wrap">
                      <div>
                        <h3 className="card-title" style={{ fontSize: "1rem" }}>{servico.nome_servico}</h3>
                        <p className="card-sub">Serviço base disponível para as barbearias.</p>
                      </div>
                      <div className="row wrap" style={{ justifyContent: "flex-end" }}>
                        <span className="badge badge--gold">{Number(servico.preco || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</span>
                        <span className="badge">{servico.duracao_min} min</span>
                      </div>
                    </div>

                    <div className="between wrap mt-4">
                      <p className="muted">A barbearia pode adicionar esse serviço ao próprio catálogo e ajustar o preço dela.</p>
                      <div className="row wrap" style={{ justifyContent: "flex-end" }}>
                        <button type="button" className="btn btn--ghost btn--sm" onClick={() => iniciarEdicaoServico(servico)}>
                          Editar
                        </button>
                        <button
                          type="button"
                          className="btn btn--danger btn--sm"
                          onClick={() => excluirServico(servico)}
                          disabled={excluindoServicoId === servico.id}
                        >
                          {excluindoServicoId === servico.id ? "Excluindo..." : "Excluir"}
                        </button>
                      </div>
                    </div>
                  </article>
                ))
              )}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

function InfoCard({ label, value }) {
  return (
    <div className="card" style={{ padding: "18px", boxShadow: "none", background: "rgba(255, 255, 255, 0.32)" }}>
      <p className="section-label">{label}</p>
      <p className="mt-2" style={{ fontSize: "1.4rem", fontWeight: 700 }}>{value}</p>
    </div>
  );
}