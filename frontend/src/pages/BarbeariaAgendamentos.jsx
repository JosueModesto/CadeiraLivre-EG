import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { barbeariaService } from "../services/barbeariaService";
import { barbeiroService } from "../services/barbeiroService";
import { servicoService } from "../services/servicoService";

function formatarDataHora(valor) {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
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
  agendado: "bg-amber-100 text-amber-900 border-amber-200",
  concluido: "bg-emerald-100 text-emerald-900 border-emerald-200",
  cancelado: "bg-rose-100 text-rose-900 border-rose-200",
};

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
        const response = await barbeariaService.getProximosAgendamentos(barbearia.id, {
          data: dataAgenda,
        });
        setProximosAgendamentos(response.agendamentos || []);
      } catch (err) {
        setError(err.response?.data?.message || "Erro ao carregar próximos agendamentos");
      }
    }

    carregarProximos();
  }, [barbearia, barbeiros, dataAgenda]);

  const agendaFiltrada = useMemo(() => {
    return agendaDia.filter((agendamento) => statusFiltro === "todos" || agendamento.status === statusFiltro);
  }, [agendaDia, statusFiltro]);

  const proximosFiltrados = useMemo(() => {
    return proximosAgendamentos.filter((agendamento) => statusFiltro === "todos" || agendamento.status === statusFiltro);
  }, [proximosAgendamentos, statusFiltro]);

  if (loading) {
    return <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-8 text-white">Carregando agenda da barbearia...</div>;
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
          <button onClick={() => navigate("/barbearia")} className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium hover:bg-slate-100">
            Voltar para configuracoes
          </button>
          <h1 className="text-2xl font-bold">Agenda da Barbearia</h1>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold">{barbearia.nome_comercial}</span>
        </div>
      </nav>

      <main className="mx-auto max-w-7xl px-4 py-8">
        <section className="rounded-2xl bg-white p-6 text-slate-900 shadow-xl">
          <div className="grid gap-4 md:grid-cols-[1fr_220px_180px] md:items-end">
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-slate-700">Barbeiro</span>
              <select value={barbeiroSelecionadoId} onChange={(event) => setBarbeiroSelecionadoId(event.target.value)} className="w-full rounded-xl border border-slate-200 px-4 py-3">
                <option value="">Selecione</option>
                {barbeiros.map((barbeiro) => (
                  <option key={barbeiro.id} value={barbeiro.id}>{barbeiro.nome}</option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-slate-700">Data</span>
              <input type="date" value={dataAgenda} onChange={(event) => setDataAgenda(event.target.value)} className="w-full rounded-xl border border-slate-200 px-4 py-3" />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-slate-700">Status</span>
              <select value={statusFiltro} onChange={(event) => setStatusFiltro(event.target.value)} className="w-full rounded-xl border border-slate-200 px-4 py-3">
                <option value="todos">Todos</option>
                <option value="agendado">Agendado</option>
                <option value="concluido">Concluido</option>
                <option value="cancelado">Cancelado</option>
              </select>
            </label>
          </div>

          {error ? <div className="mt-5 rounded-xl border border-rose-300 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div> : null}

          <div className="mt-6 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="rounded-xl border border-slate-200 p-4">
              <h2 className="text-lg font-bold">Agendamentos do barbeiro no dia</h2>
              <div className="mt-4 space-y-3">
                {agendaFiltrada.length === 0 ? (
                  <p className="text-sm text-slate-500">Nenhum agendamento encontrado para os filtros selecionados.</p>
                ) : (
                  agendaFiltrada.map((agendamento) => {
                    const servicos = (agendamento.itens || []).map((item) => mapaServicos[item.servico_id] || `Serviço #${item.servico_id}`);
                    const indicadores = obterIndicadores(agendamento);
                    const statusClass = statusClasses[agendamento.status] || "bg-slate-100 text-slate-900 border-slate-200";

                    return (
                      <div key={agendamento.id} className={`rounded-xl border p-4 ${indicadores.emAndamento ? "border-emerald-300 bg-emerald-50" : indicadores.proximo ? "border-amber-300 bg-amber-50" : "border-slate-200 bg-slate-50"}`}>
                        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                          <div>
                            <p className="font-semibold text-slate-900">{agendamento.cliente?.nome || "Cliente"}</p>
                            <p className="text-sm text-slate-500">{formatarDataHora(agendamento.data_hora_inicio)} - {formatarDataHora(agendamento.data_hora_fim)}</p>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            <span className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase ${statusClass}`}>{agendamento.status}</span>
                            {indicadores.emAndamento ? <span className="rounded-full bg-emerald-600 px-3 py-1 text-xs font-semibold text-white">Em andamento</span> : null}
                            {indicadores.proximo ? <span className="rounded-full bg-amber-500 px-3 py-1 text-xs font-semibold text-white">Proximo</span> : null}
                          </div>
                        </div>
                        <div className="mt-3 flex flex-wrap gap-2">
                          {servicos.map((servico) => (
                            <span key={`${agendamento.id}-${servico}`} className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-900">{servico}</span>
                          ))}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 p-4">
              <h2 className="text-lg font-bold">Proximos agendamentos</h2>
              <p className="mt-1 text-sm text-slate-500">Lista combinada de todos os barbeiros.</p>
              <div className="mt-4 space-y-3">
                {proximosFiltrados.length === 0 ? (
                  <p className="text-sm text-slate-500">Nenhum próximo agendamento encontrado.</p>
                ) : (
                  proximosFiltrados.map((agendamento) => {
                    const indicadores = obterIndicadores(agendamento);
                    return (
                      <div key={agendamento.id} className={`rounded-xl border p-4 ${indicadores.emAndamento ? "border-emerald-300 bg-emerald-50" : indicadores.proximo ? "border-amber-300 bg-amber-50" : "border-slate-200 bg-slate-50"}`}>
                        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                          <div>
                            <p className="font-semibold text-slate-900">{agendamento.cliente?.nome || "Cliente"}</p>
                            <p className="text-sm text-slate-500">Barbeiro: {agendamento.barbeiro?.nome || "Não informado"}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium text-slate-700">{formatarDataHora(agendamento.data_hora_inicio)}</p>
                            {indicadores.emAndamento ? <p className="text-xs font-semibold text-emerald-700">Em andamento</p> : indicadores.proximo ? <p className="text-xs font-semibold text-amber-700">Comeca em ate 30 min</p> : null}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}