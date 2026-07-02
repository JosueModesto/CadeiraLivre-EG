import { useEffect, useMemo, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";
import { cidadeService } from "../services/cidadeService";
import { barbeariaService } from "../services/barbeariaService";

export default function SelecionarBarbeariaAgendamento() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [cidades, setCidades] = useState([]);
  const [cidadeId, setCidadeId] = useState("");
  const [termoBusca, setTermoBusca] = useState("");
  const [barbearias, setBarbearias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function carregarCidades() {
      try {
        const response = await cidadeService.getAll();
        const lista = response.cidades || [];
        setCidades(lista);
        if (lista.length > 0) {
          const cidadeInicial = lista.find((cidade) => String(cidade.id) === String(user?.cidade_id));
          setCidadeId(String(cidadeInicial?.id || lista[0].id));
        }
      } catch (err) {
        setError(err.response?.data?.message || "Erro ao carregar cidades.");
      }
    }

    carregarCidades();
  }, [user?.cidade_id]);

  async function pesquisarBarbearias() {
    if (!cidadeId) {
      setError("Selecione uma cidade para pesquisar.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await barbeariaService.getAll({ cidade_id: cidadeId });
      const lista = response.barbearias || [];
      const termo = termoBusca.trim().toLowerCase();

      const filtradas = termo
        ? lista.filter((barbearia) => {
            const texto = [barbearia.nome_comercial, barbearia.endereco].join(" ").toLowerCase();
            return texto.includes(termo);
          })
        : lista;

      setBarbearias(filtradas);
    } catch (err) {
      setBarbearias([]);
      setError(err.response?.data?.message || "Erro ao pesquisar barbearias.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (cidadeId) {
      pesquisarBarbearias();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cidadeId]);

  const cidadeSelecionada = useMemo(
    () => cidades.find((cidade) => String(cidade.id) === String(cidadeId)),
    [cidades, cidadeId]
  );

  if (user?.tipo_usuario === "barbearia") {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="app-shell">
      <Navbar title="Escolher barbearia" onBack={() => navigate("/dashboard")} />

      <main className="container page fade-in">
        <h1 className="page-title">Escolha a barbearia</h1>
        <p className="muted mt-2">Selecione a cidade e pesquise a barbearia para continuar o agendamento.</p>

        <section className="card mt-6">
          <div className="grid grid-2" style={{ alignItems: "end" }}>
            <div className="field">
              <label>Cidade</label>
              <select value={cidadeId} onChange={(event) => setCidadeId(event.target.value)}>
                <option value="">Selecione</option>
                {cidades.map((cidade) => (
                  <option key={cidade.id} value={cidade.id}>
                    {cidade.nome} - {cidade.estado}
                  </option>
                ))}
              </select>
            </div>

            <div className="field">
              <label>Pesquisar barbearia</label>
              <div className="row" style={{ gap: "10px" }}>
                <input
                  type="text"
                  value={termoBusca}
                  onChange={(event) => setTermoBusca(event.target.value)}
                  placeholder="Nome ou endereço"
                />
                <button type="button" className="btn btn--ghost" onClick={pesquisarBarbearias}>
                  Pesquisar
                </button>
              </div>
            </div>
          </div>

          <p className="mt-4" style={{ fontWeight: 600 }}>
            Cidade selecionada: {cidadeSelecionada ? `${cidadeSelecionada.nome} - ${cidadeSelecionada.estado}` : "—"}
          </p>

          {error ? <div className="alert alert--error mt-4">{error}</div> : null}
        </section>

        <section className="card mt-6">
          {loading ? (
            <div className="center" style={{ padding: "24px" }}>
              <div className="spinner" style={{ margin: "0 auto 16px" }} />
              <p className="muted">Carregando barbearias...</p>
            </div>
          ) : barbearias.length === 0 ? (
            <p className="muted">Nenhuma barbearia encontrada para esta cidade.</p>
          ) : (
            <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "12px" }}>
              {barbearias.map((barbearia) => (
                <article key={barbearia.id} className="card" style={{ padding: "16px", boxShadow: "none" }}>
                  <p style={{ fontWeight: 700 }}>{barbearia.nome_comercial}</p>
                  <p className="faint mt-2" style={{ fontSize: "0.82rem" }}>{barbearia.endereco}</p>
                  <p className="muted mt-2" style={{ fontSize: "0.84rem" }}>
                    {Number(barbearia.total_servicos || 0)} serviços disponíveis
                  </p>
                  <button
                    type="button"
                    className="btn btn--primary btn--block mt-4"
                    onClick={() => navigate(`/novo-agendamento/barbearia/${barbearia.id}`)}
                  >
                    Escolher barbearia
                  </button>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
