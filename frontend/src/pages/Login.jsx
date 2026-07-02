import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { authService } from "../services/api";
import { cidadeService } from "../services/cidadeService";
import { barbeariaService } from "../services/barbeariaService";

const clienteInicial = { nome: "", telefone: "", email: "", senha: "", cidade_id: "" };
const barbeariaInicial = {
  nome: "",
  telefone: "",
  email: "",
  senha: "",
  cidade_id: "",
  nome_comercial: "",
  telefone_comercial: "",
  endereco: "",
  descricao: "",
};

const REGEX_SOMENTE_DIGITOS = /^\d+$/;
const REGEX_NOME_APENAS_LETRAS_ESPACOS = /^[A-Za-zÀ-ÖØ-öø-ÿ\s]+$/;

function validarTelefoneSomenteNumeros(valor) {
  return REGEX_SOMENTE_DIGITOS.test(String(valor || "").trim());
}

function validarNomeSemNumerosESimbolos(valor) {
  const nome = String(valor || "").trim();
  return nome.length >= 2 && REGEX_NOME_APENAS_LETRAS_ESPACOS.test(nome);
}

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [mode, setMode] = useState("login"); // "login" | "register"
  const [tipoUsuario, setTipoUsuario] = useState("cliente"); // "cliente" | "barbearia"
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");

  const [cliente, setCliente] = useState(clienteInicial);
  const [barbearia, setBarbearia] = useState(barbeariaInicial);
  const [cidades, setCidades] = useState([]);
  const [carregandoCidades, setCarregandoCidades] = useState(true);
  const [erroCidades, setErroCidades] = useState("");

  useEffect(() => {
    let ativo = true;

    const carregarCidades = async (tentativa = 1) => {
      try {
        const res = await cidadeService.getAll();
        if (!ativo) return;

        const lista = Array.isArray(res?.cidades) ? res.cidades : [];
        setCidades(lista);
        setErroCidades("");
      } catch {
        if (!ativo) return;

        if (tentativa < 2) {
          setTimeout(() => {
            carregarCidades(tentativa + 1);
          }, 800);
          return;
        }

        setErroCidades("Não foi possível carregar as cidades agora.");
      } finally {
        if (ativo) {
          setCarregandoCidades(false);
        }
      }
    };

    carregarCidades();

    return () => {
      ativo = false;
    };
  }, []);

  function selecionarTipo(tipo) {
    setTipoUsuario(tipo);
    setError("");
  }

  function abrirCadastro() {
    setMode("register");
    setError("");
    setShowPassword(false);
  }

  function voltarLogin() {
    setMode("login");
    setError("");
    setShowPassword(false);
  }

  async function handleLogin(e) {
    e.preventDefault();
    setError("");
    if (!email || !senha) {
      setError("Informe e-mail e senha.");
      return;
    }
    setLoading(true);
    try {
      await login(email, senha);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Não foi possível entrar. Verifique suas credenciais.");
    } finally {
      setLoading(false);
    }
  }

  async function handleCadastroCliente(e) {
    e.preventDefault();
    setError("");

    if (!cliente.nome || !cliente.telefone || !cliente.email || !cliente.senha) {
      setError("Preencha nome, telefone, e-mail e senha.");
      return;
    }

    if (!validarNomeSemNumerosESimbolos(cliente.nome)) {
      setError("Nome deve conter apenas letras e espaços.");
      return;
    }

    if (!validarTelefoneSomenteNumeros(cliente.telefone)) {
      setError("Telefone deve conter apenas números.");
      return;
    }

    if (cliente.senha.length < 6) {
      setError("A senha deve ter no mínimo 6 caracteres.");
      return;
    }

    setLoading(true);
    try {
      await authService.register({
        nome: cliente.nome.trim(),
        telefone: cliente.telefone.trim(),
        email: cliente.email,
        senha: cliente.senha,
        tipo_usuario: "cliente",
        cidade_id: cliente.cidade_id ? Number(cliente.cidade_id) : null,
      });
      await login(cliente.email, cliente.senha);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Não foi possível concluir o cadastro.");
    } finally {
      setLoading(false);
    }
  }

  async function handleCadastroBarbearia(e) {
    e.preventDefault();
    setError("");

    const obrigatorios = [
      barbearia.nome,
      barbearia.telefone,
      barbearia.email,
      barbearia.senha,
      barbearia.nome_comercial,
      barbearia.endereco,
      barbearia.cidade_id,
    ];
    if (obrigatorios.some((v) => !v)) {
      setError("Preencha todos os campos obrigatórios da conta e da barbearia.");
      return;
    }

    if (!validarNomeSemNumerosESimbolos(barbearia.nome)) {
      setError("Nome do responsável deve conter apenas letras e espaços.");
      return;
    }

    if (!validarTelefoneSomenteNumeros(barbearia.telefone)) {
      setError("Telefone pessoal deve conter apenas números.");
      return;
    }

    if (barbearia.telefone_comercial && !validarTelefoneSomenteNumeros(barbearia.telefone_comercial)) {
      setError("Telefone comercial deve conter apenas números.");
      return;
    }

    if (barbearia.senha.length < 6) {
      setError("A senha deve ter no mínimo 6 caracteres.");
      return;
    }

    setLoading(true);
    try {
      const cidadeId = Number(barbearia.cidade_id);

      // 1) Cria o usuário dono
      const usuario = await authService.register({
        nome: barbearia.nome.trim(),
        telefone: barbearia.telefone.trim(),
        email: barbearia.email,
        senha: barbearia.senha,
        tipo_usuario: "barbearia",
        cidade_id: cidadeId,
      });

      // 2) Cria a barbearia já linkada ao usuário
      await barbeariaService.create({
        usuario_id: usuario.id,
        nome_comercial: barbearia.nome_comercial,
        telefone_comercial: barbearia.telefone_comercial ? barbearia.telefone_comercial.trim() : null,
        endereco: barbearia.endereco,
        cidade_id: cidadeId,
        descricao: barbearia.descricao || "",
      });

      // 3) Autentica e segue para escolher os serviços
      await login(barbearia.email, barbearia.senha);
      navigate("/barbearia");
    } catch (err) {
      setError(err.response?.data?.message || "Não foi possível concluir o cadastro da barbearia.");
    } finally {
      setLoading(false);
    }
  }

  const atualizarCliente = (campo, valor) => {
    setCliente((c) => ({ ...c, [campo]: valor }));
    setError("");
  };
  const atualizarBarbearia = (campo, valor) => {
    setBarbearia((c) => ({ ...c, [campo]: valor }));
    setError("");
  };

  return (
    <div className="app-shell" style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }}>
      <div className="fade-in" style={{ width: "100%", maxWidth: "460px" }}>
        <div className="center" style={{ marginBottom: "24px" }}>
          <div className="brand" style={{ justifyContent: "center", fontSize: "1.7rem" }}>
            <span className="scissors">✂</span> Cadeira Livre
          </div>
          <p className="muted mt-2" style={{ fontSize: "0.92rem" }}>Agende seu horário na barbearia.</p>
        </div>

        <div className="card">
          {mode === "register" ? (
            <div className="field" style={{ marginBottom: "20px" }}>
              <span className="field-label">Você é</span>
              <div className="row" style={{ gap: "8px" }}>
                <button
                  type="button"
                  className={tipoUsuario === "cliente" ? "btn btn--primary btn--block" : "btn btn--ghost btn--block"}
                  onClick={() => selecionarTipo("cliente")}
                >
                  Cliente
                </button>
                <button
                  type="button"
                  className={tipoUsuario === "barbearia" ? "btn btn--primary btn--block" : "btn btn--ghost btn--block"}
                  onClick={() => selecionarTipo("barbearia")}
                >
                  Barbearia
                </button>
              </div>
            </div>
          ) : null}

          {mode === "login" ? (
            <form onSubmit={handleLogin} className="stack stack-5">
              <div className="field">
                <label htmlFor="email">
                  E-mail <span style={requiredMarkStyle}>*</span>
                </label>
                <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="voce@exemplo.com" autoComplete="email" />
              </div>
              <div className="field">
                <label htmlFor="senha">
                  Senha <span style={requiredMarkStyle}>*</span>
                </label>
                <div style={{ position: "relative" }}>
                  <input
                    id="senha"
                    type={showPassword ? "text" : "password"}
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                    placeholder="Sua senha"
                    autoComplete="current-password"
                    style={{ paddingRight: "84px" }}
                  />
                  <button type="button" onClick={() => setShowPassword((v) => !v)} style={senhaToggleStyle}>
                    {showPassword ? "Ocultar" : "Mostrar"}
                  </button>
                </div>
              </div>

              {error ? <div className="alert alert--error">{error}</div> : null}

              <button type="submit" className="btn btn--primary btn--block" disabled={loading}>
                {loading ? "Entrando..." : "Entrar"}
              </button>
            </form>
          ) : tipoUsuario === "cliente" ? (
            <form onSubmit={handleCadastroCliente} className="stack stack-4">
              <div className="section-label">Dados do cliente</div>
              <Campo label="Nome completo" required value={cliente.nome} onChange={(v) => atualizarCliente("nome", v)} placeholder="Seu nome" />
              <Campo label="Telefone" required type="tel" value={cliente.telefone} onChange={(v) => atualizarCliente("telefone", v)} placeholder="Ex.: 44999990000" />
              <Campo label="E-mail" required type="email" value={cliente.email} onChange={(v) => atualizarCliente("email", v)} placeholder="voce@exemplo.com" />
              <CampoSenha label="Senha" required value={cliente.senha} onChange={(v) => atualizarCliente("senha", v)} show={showPassword} toggle={() => setShowPassword((s) => !s)} />
              <SelectCidade
                value={cliente.cidade_id}
                onChange={(v) => atualizarCliente("cidade_id", v)}
                cidades={cidades}
                opcional
                carregando={carregandoCidades}
              />
              {erroCidades ? <div className="alert alert--error">{erroCidades}</div> : null}

              {error ? <div className="alert alert--error">{error}</div> : null}

              <button type="submit" className="btn btn--primary btn--block mt-2" disabled={loading}>
                {loading ? "Criando conta..." : "Criar conta de cliente"}
              </button>
            </form>
          ) : (
            <form onSubmit={handleCadastroBarbearia} className="stack stack-4">
              <div className="section-label">Dados de acesso</div>
              <Campo label="Nome do responsável" required value={barbearia.nome} onChange={(v) => atualizarBarbearia("nome", v)} placeholder="Seu nome" />
              <Campo label="Telefone pessoal" required type="tel" value={barbearia.telefone} onChange={(v) => atualizarBarbearia("telefone", v)} placeholder="Ex.: 44999990000" />
              <Campo label="E-mail" required type="email" value={barbearia.email} onChange={(v) => atualizarBarbearia("email", v)} placeholder="voce@exemplo.com" />
              <CampoSenha label="Senha" required value={barbearia.senha} onChange={(v) => atualizarBarbearia("senha", v)} show={showPassword} toggle={() => setShowPassword((s) => !s)} />

              <div className="section-label mt-2">Dados da barbearia</div>
              <Campo label="Nome comercial" required value={barbearia.nome_comercial} onChange={(v) => atualizarBarbearia("nome_comercial", v)} placeholder="Ex.: Barbearia Central" />
              <Campo label="Telefone comercial" optional type="tel" value={barbearia.telefone_comercial} onChange={(v) => atualizarBarbearia("telefone_comercial", v)} placeholder="Ex.: 4430200000" />
              <Campo label="Endereço" required value={barbearia.endereco} onChange={(v) => atualizarBarbearia("endereco", v)} placeholder="Rua, número - bairro" />
              <SelectCidade
                required
                value={barbearia.cidade_id}
                onChange={(v) => atualizarBarbearia("cidade_id", v)}
                cidades={cidades}
                carregando={carregandoCidades}
              />
              {erroCidades ? <div className="alert alert--error">{erroCidades}</div> : null}
              <div className="field">
                <label>Descrição (opcional)</label>
                <input type="text" value={barbearia.descricao} onChange={(e) => atualizarBarbearia("descricao", e.target.value)} placeholder="Cortes clássicos e modernos" />
              </div>

              {error ? <div className="alert alert--error">{error}</div> : null}

              <button type="submit" className="btn btn--primary btn--block mt-2" disabled={loading}>
                {loading ? "Criando barbearia..." : "Criar conta de barbearia"}
              </button>
            </form>
          )}
        </div>

        <p className="center muted mt-6" style={{ fontSize: "0.85rem" }}>
          {mode === "login" ? (
            <>
              Ainda não tem conta?{" "}
              <button type="button" onClick={abrirCadastro} style={linkStyle}>
                Criar conta
              </button>
            </>
          ) : (
            <>
              Já tem conta?{" "}
              <button type="button" onClick={voltarLogin} style={linkStyle}>
                Entrar
              </button>
            </>
          )}
        </p>
      </div>
    </div>
  );
}

/* -------------------------------------------------------- Subcomponentes -- */

function Campo({ label, value, onChange, placeholder, type = "text", required = false, optional = false }) {
  const isTel = type === "tel";

  return (
    <div className="field">
      <label>
        {label}
        {required ? <span style={requiredMarkStyle}>*</span> : null}
        {optional ? " (opcional)" : ""}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        inputMode={isTel ? "numeric" : undefined}
        pattern={isTel ? "[0-9]*" : undefined}
      />
    </div>
  );
}

function CampoSenha({ label, value, onChange, show, toggle, required = false }) {
  return (
    <div className="field">
      <label>
        {label}
        {required ? <span style={requiredMarkStyle}>*</span> : null}
      </label>
      <div style={{ position: "relative" }}>
        <input
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Mínimo 6 caracteres"
          style={{ paddingRight: "84px" }}
        />
        <button type="button" onClick={toggle} style={senhaToggleStyle}>
          {show ? "Ocultar" : "Mostrar"}
        </button>
      </div>
    </div>
  );
}

function SelectCidade({ value, onChange, cidades, opcional = false, required = false, carregando = false }) {
  return (
    <div className="field">
      <label>
        Cidade
        {required ? <span style={requiredMarkStyle}>*</span> : null}
        {opcional ? " (opcional)" : ""}
      </label>
      <select value={value} onChange={(e) => onChange(e.target.value)}>
        <option value="">{carregando ? "Carregando cidades..." : "Selecione"}</option>
        {cidades.map((cidade) => (
          <option key={cidade.id} value={cidade.id}>
            {cidade.nome} - {cidade.estado}
          </option>
        ))}
      </select>
    </div>
  );
}

const senhaToggleStyle = {
  position: "absolute",
  right: "10px",
  top: "50%",
  transform: "translateY(-50%)",
  background: "none",
  border: "none",
  cursor: "pointer",
  fontSize: "0.8rem",
  fontWeight: 600,
  color: "var(--gold-deep)",
};

const requiredMarkStyle = {
  color: "#d32f2f",
  marginLeft: "4px",
  fontWeight: 700,
};

const linkStyle = {
  background: "none",
  border: "none",
  padding: 0,
  cursor: "pointer",
  color: "var(--gold-deep)",
  fontWeight: 700,
  fontSize: "0.85rem",
  fontFamily: "inherit",
};
