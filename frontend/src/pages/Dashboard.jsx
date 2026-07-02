import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import AdminDashboard from "./AdminDashboard";
import { usuarioService } from "../services/usuarioService";
import { barbeariaService } from "../services/barbeariaService";
import { cidadeService } from "../services/cidadeService";

const REGEX_SOMENTE_DIGITOS = /^\d+$/;

function validarTelefoneSomenteNumeros(valor) {
  return REGEX_SOMENTE_DIGITOS.test(String(valor || "").trim());
}

function Tile({ title, description, onClick }) {
  return (
    <button className="card" onClick={onClick} style={{ textAlign: "left", cursor: "pointer" }}>
      <h3 className="card-title" style={{ fontSize: "1.1rem" }}>{title}</h3>
      <p className="card-sub">{description}</p>
    </button>
  );
}

function UserDashboard() {
  const navigate = useNavigate();
  const { user, updateCurrentUser } = useAuth();
  const isBarbearia = user?.tipo_usuario === "barbearia";
  const [loadingConta, setLoadingConta] = useState(true);
  const [salvandoConta, setSalvandoConta] = useState(false);
  const [editandoConta, setEditandoConta] = useState(false);
  const [mensagemConta, setMensagemConta] = useState("");
  const [erroConta, setErroConta] = useState("");
  const [cidades, setCidades] = useState([]);
  const [perfilUsuario, setPerfilUsuario] = useState(null);
  const [perfilBarbearia, setPerfilBarbearia] = useState(null);
  const [formConta, setFormConta] = useState({
    telefone: "",
    endereco: "",
    cidade_id: "",
    nome_comercial: "",
    telefone_comercial: "",
    endereco_barbearia: "",
  });

  useEffect(() => {
    async function carregarConta() {
      if (!user?.id) {
        setLoadingConta(false);
        return;
      }

      setLoadingConta(true);
      setErroConta("");

      try {
        const requisicoes = [usuarioService.getById(user.id), cidadeService.getAll()];
        if (isBarbearia) {
          requisicoes.push(barbeariaService.getAll({ usuario_id: user.id }));
        }

        const [usuarioResponse, cidadesResponse, barbeariaResponse] = await Promise.all(requisicoes);
        const usuarioAtual = usuarioResponse;
        const listaCidades = cidadesResponse.cidades || [];
        const dadosBarbearia = isBarbearia ? (barbeariaResponse?.barbearias || [])[0] || null : null;

        setPerfilUsuario(usuarioAtual);
        setCidades(listaCidades);
        setPerfilBarbearia(dadosBarbearia);
        setFormConta({
          telefone: usuarioAtual?.telefone || "",
          endereco: usuarioAtual?.endereco || "",
          cidade_id: String(dadosBarbearia?.cidade_id || usuarioAtual?.cidade_id || ""),
          nome_comercial: dadosBarbearia?.nome_comercial || "",
          telefone_comercial: dadosBarbearia?.telefone_comercial || "",
          endereco_barbearia: dadosBarbearia?.endereco || "",
        });
      } catch (error) {
        setErroConta(error.response?.data?.message || "Erro ao carregar dados da conta.");
      } finally {
        setLoadingConta(false);
      }
    }

    carregarConta();
  }, [user?.id, isBarbearia]);

  const cidadeUsuario = useMemo(
    () => cidades.find((cidade) => String(cidade.id) === String(perfilUsuario?.cidade_id)),
    [cidades, perfilUsuario?.cidade_id]
  );

  const cidadeBarbearia = useMemo(
    () => cidades.find((cidade) => String(cidade.id) === String(perfilBarbearia?.cidade_id)),
    [cidades, perfilBarbearia?.cidade_id]
  );

  function atualizarCampoConta(campo, valor) {
    setFormConta((current) => ({ ...current, [campo]: valor }));
    setErroConta("");
    setMensagemConta("");
  }

  function cancelarEdicao() {
    setEditandoConta(false);
    setErroConta("");
    setMensagemConta("");
    setFormConta({
      telefone: perfilUsuario?.telefone || "",
      endereco: perfilUsuario?.endereco || "",
      cidade_id: String(perfilBarbearia?.cidade_id || perfilUsuario?.cidade_id || ""),
      nome_comercial: perfilBarbearia?.nome_comercial || "",
      telefone_comercial: perfilBarbearia?.telefone_comercial || "",
      endereco_barbearia: perfilBarbearia?.endereco || "",
    });
  }

  async function salvarConta() {
    if (!perfilUsuario?.id) return;

    if (!validarTelefoneSomenteNumeros(formConta.telefone)) {
      setErroConta("Telefone pessoal deve conter apenas números.");
      return;
    }

    if (isBarbearia && formConta.telefone_comercial && !validarTelefoneSomenteNumeros(formConta.telefone_comercial)) {
      setErroConta("Telefone comercial deve conter apenas números.");
      return;
    }

    setSalvandoConta(true);
    setErroConta("");
    setMensagemConta("");

    try {
      const usuarioResponse = await usuarioService.update(perfilUsuario.id, {
        telefone: formConta.telefone.trim(),
        cidade_id: isBarbearia ? Number(formConta.cidade_id) : undefined,
        endereco: isBarbearia ? undefined : formConta.endereco,
      });

      let barbeariaAtualizada = perfilBarbearia;
      if (isBarbearia && perfilBarbearia?.id) {
        const barbeariaResponse = await barbeariaService.update(perfilBarbearia.id, {
          nome_comercial: formConta.nome_comercial,
          telefone_comercial: formConta.telefone_comercial ? formConta.telefone_comercial.trim() : null,
          endereco: formConta.endereco_barbearia,
          cidade_id: Number(formConta.cidade_id),
        });
        barbeariaAtualizada = barbeariaResponse.barbearia;
      }

      const usuarioAtualizado = usuarioResponse.usuario;
      setPerfilUsuario(usuarioAtualizado);
      setPerfilBarbearia(barbeariaAtualizada);
      updateCurrentUser({
        ...user,
        telefone: usuarioAtualizado.telefone,
        endereco: usuarioAtualizado.endereco,
        cidade_id: usuarioAtualizado.cidade_id,
      });
      setMensagemConta("Dados atualizados com sucesso.");
      setEditandoConta(false);
    } catch (error) {
      setErroConta(error.response?.data?.message || "Não foi possível atualizar os dados.");
    } finally {
      setSalvandoConta(false);
    }
  }

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
            <>
              <Tile
                title="Novo Agendamento"
                description="Escolha barbearia, serviços e horário."
                onClick={() => navigate("/novo-agendamento")}
              />
              <Tile
                title="Meus Agendamentos"
                description="Acompanhe suas reservas."
                onClick={() => navigate("/agendamentos")}
              />
            </>
          )}
        </div>

        <div className="card mt-6">
          <div className="between wrap">
            <div className="section-label">Sua conta</div>
            <button type="button" className="btn btn--ghost btn--sm" onClick={() => setEditandoConta(true)} disabled={loadingConta || editandoConta}>
              Editar
            </button>
          </div>

          {loadingConta ? (
            <div className="center" style={{ padding: "24px" }}>
              <div className="spinner" style={{ margin: "0 auto 16px" }} />
              <p className="muted">Carregando conta...</p>
            </div>
          ) : (
            <>
              <div className="grid grid-3 mt-4">
                <InfoItem label={isBarbearia ? "Nome do responsável" : "Nome"} value={perfilUsuario?.nome || user?.nome || "—"} />
                <InfoItem label="E-mail" value={perfilUsuario?.email || user?.email || "—"} />
                <InfoItem label="Tipo" value={<span className="badge badge--gold">{perfilUsuario?.tipo_usuario || user?.tipo_usuario}</span>} />
                <InfoItem label="Telefone pessoal" value={perfilUsuario?.telefone || "—"} />
                {!isBarbearia ? <InfoItem label="Endereço" value={perfilUsuario?.endereco || "—"} /> : null}
                {isBarbearia ? <InfoItem label="Nome comercial" value={perfilBarbearia?.nome_comercial || "—"} /> : null}
                {isBarbearia ? <InfoItem label="Telefone comercial" value={perfilBarbearia?.telefone_comercial || "—"} /> : null}
                {isBarbearia ? <InfoItem label="Endereço" value={perfilBarbearia?.endereco || "—"} /> : null}
                {isBarbearia ? <InfoItem label="Cidade" value={cidadeBarbearia ? `${cidadeBarbearia.nome} - ${cidadeBarbearia.estado}` : (cidadeUsuario ? `${cidadeUsuario.nome} - ${cidadeUsuario.estado}` : "—")} /> : null}
              </div>

              {editandoConta ? (
                <div className="card mt-6" style={{ boxShadow: "none", background: "var(--wood-700)" }}>
                  <div className="section-label">Editar dados permitidos</div>
                  <div className="grid grid-2 mt-4">
                    <div className="field">
                      <label>Nome</label>
                      <input value={perfilUsuario?.nome || ""} disabled />
                    </div>
                    <div className="field">
                      <label>E-mail</label>
                      <input value={perfilUsuario?.email || ""} disabled />
                    </div>
                    <div className="field">
                      <label>Telefone pessoal</label>
                      <input
                        type="tel"
                        value={formConta.telefone}
                        onChange={(event) => atualizarCampoConta("telefone", event.target.value)}
                        placeholder="Ex.: 44999990000"
                        inputMode="numeric"
                        pattern="[0-9]*"
                      />
                    </div>
                    {!isBarbearia ? (
                      <div className="field">
                        <label>Endereço</label>
                        <input value={formConta.endereco} onChange={(event) => atualizarCampoConta("endereco", event.target.value)} />
                      </div>
                    ) : null}
                    {isBarbearia ? (
                      <>
                        <div className="field">
                          <label>Cidade</label>
                          <select value={formConta.cidade_id} onChange={(event) => atualizarCampoConta("cidade_id", event.target.value)}>
                            <option value="">Selecione</option>
                            {cidades.map((cidade) => (
                              <option key={cidade.id} value={cidade.id}>
                                {cidade.nome} - {cidade.estado}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="field">
                          <label>Nome comercial</label>
                          <input value={formConta.nome_comercial} onChange={(event) => atualizarCampoConta("nome_comercial", event.target.value)} />
                        </div>
                        <div className="field">
                          <label>Telefone comercial</label>
                          <input
                            type="tel"
                            value={formConta.telefone_comercial}
                            onChange={(event) => atualizarCampoConta("telefone_comercial", event.target.value)}
                            placeholder="Ex.: 4430200000"
                            inputMode="numeric"
                            pattern="[0-9]*"
                          />
                        </div>
                        <div className="field" style={{ gridColumn: "1 / -1" }}>
                          <label>Endereço</label>
                          <input value={formConta.endereco_barbearia} onChange={(event) => atualizarCampoConta("endereco_barbearia", event.target.value)} />
                        </div>
                      </>
                    ) : null}
                  </div>

                  {erroConta ? <div className="alert alert--error mt-4">{erroConta}</div> : null}
                  {mensagemConta ? <div className="alert alert--success mt-4">{mensagemConta}</div> : null}

                  <div className="row mt-4" style={{ justifyContent: "flex-end" }}>
                    <button type="button" className="btn btn--ghost" onClick={cancelarEdicao} disabled={salvandoConta}>
                      Cancelar
                    </button>
                    <button type="button" className="btn btn--primary" onClick={salvarConta} disabled={salvandoConta}>
                      {salvandoConta ? "Salvando..." : "Salvar alterações"}
                    </button>
                  </div>
                </div>
              ) : null}

              {!editandoConta && erroConta ? <div className="alert alert--error mt-4">{erroConta}</div> : null}
              {!editandoConta && mensagemConta ? <div className="alert alert--success mt-4">{mensagemConta}</div> : null}
            </>
          )}
        </div>
      </main>
    </div>
  );
}

function InfoItem({ label, value }) {
  return (
    <div>
      <p className="faint" style={{ fontSize: "0.78rem", textTransform: "uppercase", letterSpacing: "0.08em" }}>{label}</p>
      <p className="mt-2">{value}</p>
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();

  if (user?.tipo_usuario === "administrador") {
    return <AdminDashboard />;
  }

  return <UserDashboard />;
}
