import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { agendamentoService } from "../services/agendamentoService";
import { servicoService } from "../services/servicoService";

function formatarDataHora(valor) {
	return new Intl.DateTimeFormat("pt-BR", {
		dateStyle: "short",
		timeStyle: "short",
	}).format(new Date(valor));
}

function formatarMoeda(valor) {
	return new Intl.NumberFormat("pt-BR", {
		style: "currency",
		currency: "BRL",
	}).format(Number(valor || 0));
}

const statusClasses = {
	agendado: "bg-amber-100 text-amber-900 border-amber-200",
	concluido: "bg-emerald-100 text-emerald-900 border-emerald-200",
	cancelado: "bg-rose-100 text-rose-900 border-rose-200",
};

export default function Agendamentos() {
	const navigate = useNavigate();
	const [agendamentos, setAgendamentos] = useState([]);
	const [mapaServicos, setMapaServicos] = useState({});
	const [loading, setLoading] = useState(true);
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
				setError(err.response?.data?.message || "Erro ao carregar agendamentos");
			} finally {
				setLoading(false);
			}
		}

		carregar();
	}, []);

	return (
		<div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white">
			<nav className="bg-white shadow-lg text-gray-900">
				<div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
					<button
						onClick={() => navigate("/dashboard")}
						className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium transition hover:bg-slate-100"
					>
						Voltar
					</button>
					<h1 className="text-2xl font-bold">Meus agendamentos</h1>
					<button
						onClick={() => navigate("/novo-agendamento")}
						className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
					>
						Novo agendamento
					</button>
				</div>
			</nav>

			<main className="mx-auto max-w-7xl px-4 py-8">
				{loading ? (
					<div className="rounded-2xl bg-white/10 p-8 text-center text-slate-200">Carregando agendamentos...</div>
				) : error ? (
					<div className="rounded-2xl border border-rose-400/40 bg-rose-500/10 p-6 text-rose-100">{error}</div>
				) : agendamentos.length === 0 ? (
					<div className="rounded-2xl bg-white/10 p-10 text-center">
						<h2 className="text-2xl font-semibold">Nenhum agendamento encontrado</h2>
						<p className="mt-3 text-slate-300">Escolha uma barbearia e reserve seu primeiro horário.</p>
					</div>
				) : (
					<div className="grid gap-5">
						{agendamentos.map((agendamento) => {
							const servicos = (agendamento.itens || []).map((item) => mapaServicos[item.servico_id] || `Serviço #${item.servico_id}`);
							const statusClass = statusClasses[agendamento.status] || "bg-slate-100 text-slate-900 border-slate-200";

							return (
								<article
									key={agendamento.id}
									className="rounded-2xl border border-white/10 bg-white p-6 text-slate-900 shadow-xl"
								>
									<div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
										<div>
											<h2 className="text-xl font-bold text-slate-900">{agendamento.barbearia?.nome_comercial || "Barbearia"}</h2>
											<p className="mt-1 text-sm text-slate-500">Barbeiro: {agendamento.barbeiro?.nome || "Não informado"}</p>
										</div>
										<span className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold uppercase ${statusClass}`}>
											{agendamento.status}
										</span>
									</div>

									<div className="mt-5 grid gap-4 md:grid-cols-3">
										<div className="rounded-xl bg-slate-50 p-4">
											<p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Data e hora</p>
											<p className="mt-2 text-lg font-semibold">{formatarDataHora(agendamento.data_hora_inicio)}</p>
										</div>
										<div className="rounded-xl bg-slate-50 p-4">
											<p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Término</p>
											<p className="mt-2 text-lg font-semibold">{formatarDataHora(agendamento.data_hora_fim)}</p>
										</div>
										<div className="rounded-xl bg-slate-50 p-4">
											<p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Valor total</p>
											<p className="mt-2 text-lg font-semibold">{formatarMoeda(agendamento.valor_total)}</p>
										</div>
									</div>

									<div className="mt-5">
										<p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Serviços</p>
										<div className="mt-3 flex flex-wrap gap-2">
											{servicos.length > 0 ? (
												servicos.map((servico) => (
													<span key={`${agendamento.id}-${servico}`} className="rounded-full bg-blue-50 px-3 py-1 text-sm font-medium text-blue-900">
														{servico}
													</span>
												))
											) : (
												<span className="text-sm text-slate-500">Sem serviços associados</span>
											)}
										</div>
									</div>
								</article>
							);
						})}
					</div>
				)}
			</main>
		</div>
	);
}
