import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { barbeariaService } from "../services/barbeariaService";
import { barbeiroService } from "../services/barbeiroService";

const DIAS_SEMANA = [
  { value: 0, label: "Domingo" },
  { value: 1, label: "Segunda" },
  { value: 2, label: "Terca" },
  { value: 3, label: "Quarta" },
  { value: 4, label: "Quinta" },
  { value: 5, label: "Sexta" },
  { value: 6, label: "Sabado" },
];

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

export default function Barbearia() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [savingFuncionamento, setSavingFuncionamento] = useState(false);
  const [savingBarbeiro, setSavingBarbeiro] = useState(false);
  const [savingDisponibilidade, setSavingDisponibilidade] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [barbearia, setBarbearia] = useState(null);
  const [funcionamento, setFuncionamento] = useState(funcionamentoInicial());
  const [barbeiros, setBarbeiros] = useState([]);
  const [barbeiroSelecionadoId, setBarbeiroSelecionadoId] = useState("");
  const [disponibilidade, setDisponibilidade] = useState(disponibilidadeInicial());
  const [novoBarbeiro, setNovoBarbeiro] = useState({ nome: "", telefone: "", ativo: true });

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

        const [configResponse, barbeirosResponse] = await Promise.all([
          barbeariaService.getAgendamentoConfig(encontrada.id),
          barbeiroService.getAll({ barbearia_id: encontrada.id }),
        ]);

        const mapaFuncionamento = new Map(
          (configResponse.funcionamento || []).map((item) => [item.dia_semana, item])
        );

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
        setError(err.response?.data?.message || "Erro ao carregar dados da barbearia");
      } finally {
        setLoading(false);
      }
    }

    if (user?.id) {
      carregar();
    }
  }, [user?.id]);

  useEffect(() => {
    async function carregarDisponibilidade() {
      if (!barbeiroSelecionadoId) {
        setDisponibilidade(disponibilidadeInicial());
        return;
      }

      try {
        const response = await barbeiroService.getDisponibilidade(barbeiroSelecionadoId);
        const agrupado = disponibilidadeInicial();

        DIAS_SEMANA.forEach((dia) => {
          agrupado[dia.value] = [];
        });

        (response.disponibilidades || []).forEach((item) => {
          const dia = Number(item.dia_semana);
          if (!agrupado[dia]) {
            agrupado[dia] = [];
          }

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
        setError(err.response?.data?.message || "Erro ao carregar disponibilidade do barbeiro");
      }
    }

    carregarDisponibilidade();
  }, [barbeiroSelecionadoId]);

  function atualizarFuncionamento(diaSemana, campo, valor) {
    setFuncionamento((current) =>
      current.map((item) =>
        item.dia_semana === diaSemana ? { ...item, [campo]: valor } : item
      )
    );
  }

  function atualizarIntervalo(diaSemana, index, campo, valor) {
    setDisponibilidade((current) => ({
      ...current,
      [diaSemana]: current[diaSemana].map((item, itemIndex) =>
        itemIndex === index ? { ...item, [campo]: valor } : item
      ),
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
      [diaSemana]: current[diaSemana].filter((_, itemIndex) => itemIndex !== index),
    }));
  }

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
      setError(err.response?.data?.message || "Erro ao salvar funcionamento");
    } finally {
      setSavingFuncionamento(false);
    }
  }

  async function criarBarbeiro(event) {
    event.preventDefault();
    if (!barbearia) return;

    setSavingBarbeiro(true);
    setError("");
    setSuccess("");

    try {
      const response = await barbeiroService.create({
        barbearia_id: barbearia.id,
        nome: novoBarbeiro.nome,
        telefone: novoBarbeiro.telefone,
        ativo: novoBarbeiro.ativo,
      });

      const item = response.barbeiro;
      const novaLista = [...barbeiros, item];
      setBarbeiros(novaLista);
      setNovoBarbeiro({ nome: "", telefone: "", ativo: true });
      setBarbeiroSelecionadoId(String(item.id));
      setSuccess("Barbeiro criado com sucesso.");
    } catch (err) {
      setError(err.response?.data?.message || "Erro ao criar barbeiro");
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
      setError(err.response?.data?.message || "Erro ao atualizar barbeiro");
    }
  }

  async function excluirBarbeiro(barbeiro) {
    const confirmar = window.confirm(`Deseja realmente excluir o barbeiro ${barbeiro.nome}?`);
    if (!confirmar) {
      return;
    }

    setError("");
    setSuccess("");

    try {
      await barbeiroService.remove(barbeiro.id);

      const listaAtualizada = barbeiros.filter((item) => item.id !== barbeiro.id);
      setBarbeiros(listaAtualizada);

      if (String(barbeiro.id) === barbeiroSelecionadoId) {
        setBarbeiroSelecionadoId(listaAtualizada.length > 0 ? String(listaAtualizada[0].id) : "");
      }

      if (listaAtualizada.length === 0) {
        setDisponibilidade(disponibilidadeInicial());
      }

      setSuccess("Barbeiro excluido com sucesso.");
    } catch (err) {
      setError(err.response?.data?.message || "Erro ao excluir barbeiro");
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
          if (intervalos.length === 0) {
            return [{ dia_semana: dia.value, esta_disponivel: false }];
          }

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
      setError(err.response?.data?.message || "Erro ao salvar disponibilidade do barbeiro");
    } finally {
      setSavingDisponibilidade(false);
    }
  }

  if (loading) {
    return <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-8 text-white">Carregando barbearia...</div>;
  }

  if (user?.tipo_usuario !== "barbearia") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-8 text-white">
        <div className="mx-auto max-w-3xl rounded-2xl bg-white/10 p-8 text-center">
          <h1 className="text-2xl font-bold">Tela exclusiva para dono de barbearia</h1>
          <button onClick={() => navigate("/dashboard")} className="mt-6 rounded-lg bg-white px-4 py-2 text-slate-900">
            Voltar
          </button>
        </div>
      </div>
    );
  }

  if (!barbearia) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-8 text-white">
        <div className="mx-auto max-w-3xl rounded-2xl bg-white/10 p-8 text-center">
          <h1 className="text-2xl font-bold">Nenhuma barbearia encontrada para este usuario</h1>
          <p className="mt-3 text-slate-300">Cadastre uma barbearia antes de configurar funcionamento e disponibilidade.</p>
          <button onClick={() => navigate("/dashboard")} className="mt-6 rounded-lg bg-white px-4 py-2 text-slate-900">
            Voltar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white">
      <nav className="bg-white shadow-lg text-slate-900">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
          <button onClick={() => navigate("/dashboard")} className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium hover:bg-slate-100">
            Voltar
          </button>
          <h1 className="text-2xl font-bold">Painel da Barbearia</h1>
          <div className="flex items-center gap-3">
            <button onClick={() => navigate("/barbearia/agendamentos")} className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800">
              Ir para agenda
            </button>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold">{barbearia.nome_comercial}</span>
          </div>
        </div>
      </nav>

      <main className="mx-auto grid max-w-7xl gap-6 px-4 py-8 lg:grid-cols-[1fr_1fr]">
        <section className="rounded-2xl bg-white p-6 text-slate-900 shadow-xl">
          <h2 className="text-2xl font-bold">Funcionamento</h2>
          <p className="mt-2 text-sm text-slate-500">Configure a janela principal de atendimento da barbearia por dia.</p>

          <div className="mt-6 space-y-4">
            {funcionamento.map((dia) => (
              <div key={dia.dia_semana} className="rounded-xl border border-slate-200 p-4">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="font-semibold">{DIAS_SEMANA.find((item) => item.value === dia.dia_semana)?.label}</p>
                  </div>
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={dia.esta_aberto}
                      onChange={(event) => atualizarFuncionamento(dia.dia_semana, "esta_aberto", event.target.checked)}
                    />
                    Aberto
                  </label>
                </div>

                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  <input
                    type="time"
                    value={dia.hora_abertura}
                    disabled={!dia.esta_aberto}
                    onChange={(event) => atualizarFuncionamento(dia.dia_semana, "hora_abertura", event.target.value)}
                    className="rounded-lg border border-slate-200 px-3 py-2 disabled:bg-slate-100"
                  />
                  <input
                    type="time"
                    value={dia.hora_fechamento}
                    disabled={!dia.esta_aberto}
                    onChange={(event) => atualizarFuncionamento(dia.dia_semana, "hora_fechamento", event.target.value)}
                    className="rounded-lg border border-slate-200 px-3 py-2 disabled:bg-slate-100"
                  />
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={salvarFuncionamento}
            disabled={savingFuncionamento}
            className="mt-6 w-full rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
          >
            {savingFuncionamento ? "Salvando funcionamento..." : "Salvar funcionamento"}
          </button>
        </section>

        <section className="space-y-6">
          <div className="rounded-2xl bg-white p-6 text-slate-900 shadow-xl">
            <h2 className="text-2xl font-bold">Barbeiros</h2>
            <form onSubmit={criarBarbeiro} className="mt-5 grid gap-3 md:grid-cols-[1.2fr_1fr_auto]">
              <input
                value={novoBarbeiro.nome}
                onChange={(event) => setNovoBarbeiro((current) => ({ ...current, nome: event.target.value }))}
                placeholder="Nome do barbeiro"
                className="rounded-lg border border-slate-200 px-3 py-2"
              />
              <input
                value={novoBarbeiro.telefone}
                onChange={(event) => setNovoBarbeiro((current) => ({ ...current, telefone: event.target.value }))}
                placeholder="Telefone"
                className="rounded-lg border border-slate-200 px-3 py-2"
              />
              <button
                type="submit"
                disabled={savingBarbeiro}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
              >
                {savingBarbeiro ? "Criando..." : "Adicionar"}
              </button>
            </form>

            <div className="mt-5 space-y-3">
              {barbeiros.map((barbeiro) => (
                <div key={barbeiro.id} className="flex flex-col gap-3 rounded-xl border border-slate-200 p-4 md:flex-row md:items-center md:justify-between">
                  <button
                    onClick={() => setBarbeiroSelecionadoId(String(barbeiro.id))}
                    className={`text-left ${String(barbeiro.id) === barbeiroSelecionadoId ? "font-bold text-blue-700" : "text-slate-900"}`}
                  >
                    <p>{barbeiro.nome}</p>
                    <p className="text-sm text-slate-500">{barbeiro.telefone}</p>
                  </button>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => alternarAtivo(barbeiro)}
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${barbeiro.ativo ? "bg-emerald-100 text-emerald-900" : "bg-rose-100 text-rose-900"}`}
                    >
                      {barbeiro.ativo ? "Ativo" : "Inativo"}
                    </button>
                    <button
                      onClick={() => excluirBarbeiro(barbeiro)}
                      className="rounded-full bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-700 hover:bg-rose-100"
                    >
                      Excluir
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl bg-white p-6 text-slate-900 shadow-xl">
            <h2 className="text-2xl font-bold">Disponibilidade do barbeiro</h2>
            <p className="mt-2 text-sm text-slate-500">Selecione um barbeiro e defina os intervalos em que ele aceita agendamentos.</p>

            <div className="mt-6 space-y-4">
              {DIAS_SEMANA.map((dia) => (
                <div key={dia.value} className="rounded-xl border border-slate-200 p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <h3 className="font-semibold">{dia.label}</h3>
                    <button onClick={() => adicionarIntervalo(dia.value)} className="text-sm font-semibold text-blue-700">
                      + intervalo
                    </button>
                  </div>

                  <div className="space-y-3">
                    {(disponibilidade[dia.value] || []).map((intervalo, index) => (
                      <div key={`${dia.value}-${index}`} className="grid gap-3 md:grid-cols-[auto_1fr_1fr_auto] md:items-center">
                        <label className="flex items-center gap-2 text-sm">
                          <input
                            type="checkbox"
                            checked={intervalo.esta_disponivel}
                            onChange={(event) => atualizarIntervalo(dia.value, index, "esta_disponivel", event.target.checked)}
                          />
                          Disponivel
                        </label>
                        <input
                          type="time"
                          value={intervalo.hora_inicio}
                          disabled={!intervalo.esta_disponivel}
                          onChange={(event) => atualizarIntervalo(dia.value, index, "hora_inicio", event.target.value)}
                          className="rounded-lg border border-slate-200 px-3 py-2 disabled:bg-slate-100"
                        />
                        <input
                          type="time"
                          value={intervalo.hora_fim}
                          disabled={!intervalo.esta_disponivel}
                          onChange={(event) => atualizarIntervalo(dia.value, index, "hora_fim", event.target.value)}
                          className="rounded-lg border border-slate-200 px-3 py-2 disabled:bg-slate-100"
                        />
                        {(disponibilidade[dia.value] || []).length > 1 ? (
                          <button onClick={() => removerIntervalo(dia.value, index)} className="text-sm font-semibold text-rose-700">
                            remover
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
              onClick={salvarDisponibilidade}
              disabled={!barbeiroSelecionadoId || savingDisponibilidade}
              className="mt-6 w-full rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
            >
              {savingDisponibilidade ? "Salvando disponibilidade..." : "Salvar disponibilidade do barbeiro"}
            </button>
          </div>

          {error ? <div className="rounded-xl border border-rose-300 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div> : null}
          {success ? <div className="rounded-xl border border-emerald-300 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{success}</div> : null}
        </section>
      </main>
    </div>
  );
}