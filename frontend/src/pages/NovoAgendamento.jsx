import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { agendamentoService } from "../services/agendamentoService";
import { barbeariaService } from "../services/barbeariaService";
import { barbeiroService } from "../services/barbeiroService";
import { servicoService } from "../services/servicoService";

function formatarHorario(valor) {
	return new Intl.DateTimeFormat("pt-BR", {
		timeStyle: "short",
	}).format(new Date(valor));
}

function formatarMoeda(valor) {
	return new Intl.NumberFormat("pt-BR", {
		style: "currency",
		currency: "BRL",
	}).format(Number(valor || 0));
}

export default function NovoAgendamento() {
	const navigate = useNavigate();
	const [barbearias, setBarbearias] = useState([]);
	const [barbeiros, setBarbeiros] = useState([]);
	const [servicos, setServicos] = useState([]);
	const [horarios, setHorarios] = useState([]);
	const [loadingInicial, setLoadingInicial] = useState(true);
	const [loadingHorarios, setLoadingHorarios] = useState(false);
	const [submitting, setSubmitting] = useState(false);
	const [error, setError] = useState("");
	const [success, setSuccess] = useState("");
	const [form, setForm] = useState({
		barbearia_id: "",
		barbeiro_id: "",
		data: "",
		servico_ids: [],
		data_hora_inicio: "",
	});

	useEffect(() => {
		async function carregarBarbearias() {
			setLoadingInicial(true);
			setError("");

			try {
				const response = await barbeariaService.getAll();
				setBarbearias(response.barbearias || []);
			} catch (err) {
				setError(err.response?.data?.message || "Erro ao carregar barbearias");
			} finally {
				setLoadingInicial(false);
			}
		}

		carregarBarbearias();
	}, []);

	useEffect(() => {
		async function carregarDependencias() {
			if (!form.barbearia_id) {
				setBarbeiros([]);
				setServicos([]);
				return;
			}

			setError("");
			setSuccess("");

			try {
				const [barbeirosResponse, servicosResponse] = await Promise.all([
					barbeiroService.getAll({ barbearia_id: form.barbearia_id }),
					servicoService.getAll({ barbearia_id: form.barbearia_id }),
				]);

				setBarbeiros((barbeirosResponse.barbeiros || []).filter((item) => item.ativo));
				setServicos(servicosResponse.servicos || []);
			} catch (err) {
				setError(err.response?.data?.message || "Erro ao carregar barbeiros e serviços");
			}
		}

		carregarDependencias();
	}, [form.barbearia_id]);

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
				setError(err.response?.data?.message || "Erro ao buscar horários disponíveis");
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
			setError("Selecione barbearia, barbeiro, data, horário e ao menos um serviço.");
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
			setError(err.response?.data?.message || "Erro ao criar agendamento");
		} finally {
			setSubmitting(false);
		}
	}

	const barbeiroSelecionado = barbeiros.find((item) => String(item.id) === String(form.barbeiro_id));
	const valorTotal = servicos
		.filter((servico) => form.servico_ids.includes(servico.id))
		.reduce((total, servico) => total + Number(servico.preco), 0);

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
					<h1 className="text-2xl font-bold">Novo agendamento</h1>
					<button
						onClick={() => navigate("/agendamentos")}
						className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-700"
					>
						Ver agendamentos
					</button>
				</div>
			</nav>

			<main className="mx-auto grid max-w-7xl gap-6 px-4 py-8 lg:grid-cols-[1.35fr_0.85fr]">
				<section className="rounded-2xl bg-white p-6 text-slate-900 shadow-xl">
					<h2 className="text-2xl font-bold">Reserve seu horário</h2>
					<p className="mt-2 text-sm text-slate-500">Selecione a barbearia, o barbeiro, os serviços e um horário liberado pela agenda.</p>

					{loadingInicial ? (
						<div className="mt-6 rounded-xl bg-slate-50 p-6 text-center text-slate-500">Carregando dados iniciais...</div>
					) : (
						<form onSubmit={handleSubmit} className="mt-6 space-y-6">
							<div className="grid gap-5 md:grid-cols-2">
								<label className="block">
									<span className="mb-2 block text-sm font-semibold text-slate-700">Barbearia</span>
									<select
										value={form.barbearia_id}
										onChange={(event) => {
											const valor = event.target.value;
											setForm({
												barbearia_id: valor,
												barbeiro_id: "",
												data: "",
												servico_ids: [],
												data_hora_inicio: "",
											});
											setHorarios([]);
										}}
										className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-blue-500"
									>
										<option value="">Selecione</option>
										{barbearias.map((barbearia) => (
											<option key={barbearia.id} value={barbearia.id}>
												{barbearia.nome_comercial}
											</option>
										))}
									</select>
								</label>

								<label className="block">
									<span className="mb-2 block text-sm font-semibold text-slate-700">Barbeiro</span>
									<select
										value={form.barbeiro_id}
										onChange={(event) => atualizarCampo("barbeiro_id", event.target.value)}
										disabled={!form.barbearia_id}
										className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-blue-500 disabled:bg-slate-100"
									>
										<option value="">Selecione</option>
										{barbeiros.map((barbeiro) => (
											<option key={barbeiro.id} value={barbeiro.id}>
												{barbeiro.nome}
											</option>
										))}
									</select>
								</label>
							</div>

							<label className="block">
								<span className="mb-2 block text-sm font-semibold text-slate-700">Data</span>
								<input
									type="date"
									value={form.data}
									min={new Date().toISOString().slice(0, 10)}
									onChange={(event) => atualizarCampo("data", event.target.value)}
									disabled={!form.barbearia_id || !form.barbeiro_id}
									className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-blue-500 disabled:bg-slate-100"
								/>
							</label>

							<div>
								<div className="mb-2 flex items-center justify-between">
									<span className="block text-sm font-semibold text-slate-700">Serviços</span>
									<span className="text-sm text-slate-500">Selecione um ou mais</span>
								</div>
								<div className="grid gap-3 md:grid-cols-2">
									{servicos.map((servico) => {
										const ativo = form.servico_ids.includes(servico.id);
										return (
											<button
												key={servico.id}
												type="button"
												onClick={() => alternarServico(servico.id)}
												className={`rounded-xl border p-4 text-left transition ${
													ativo
														? "border-blue-600 bg-blue-50"
														: "border-slate-200 bg-white hover:border-slate-300"
												}`}
											>
												<div className="flex items-start justify-between gap-4">
													<div>
														<p className="font-semibold text-slate-900">{servico.nome_servico}</p>
														<p className="mt-1 text-sm text-slate-500">Duração informativa: {servico.duracao_min} min</p>
													</div>
													<span className="rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold text-white">
														{formatarMoeda(servico.preco)}
													</span>
												</div>
											</button>
										);
									})}
								</div>
							</div>

							<div>
								<div className="mb-2 flex items-center justify-between">
									<span className="block text-sm font-semibold text-slate-700">Horários disponíveis</span>
									{loadingHorarios ? <span className="text-sm text-slate-500">Consultando...</span> : null}
								</div>
								{!form.data ? (
									<div className="rounded-xl bg-slate-50 p-4 text-sm text-slate-500">Selecione a data para ver os horários disponíveis.</div>
								) : horarios.length === 0 ? (
									<div className="rounded-xl bg-slate-50 p-4 text-sm text-slate-500">Nenhum horário disponível para os filtros selecionados.</div>
								) : (
									<div className="grid grid-cols-2 gap-3 md:grid-cols-4">
										{horarios.map((horario) => {
											const ativo = form.data_hora_inicio === horario;
											return (
												<button
													key={horario}
													type="button"
													onClick={() => atualizarCampo("data_hora_inicio", horario)}
													className={`rounded-xl border px-4 py-3 text-sm font-semibold transition ${
														ativo
															? "border-blue-600 bg-blue-600 text-white"
															: "border-slate-200 bg-white text-slate-900 hover:border-slate-300"
													}`}
												>
													{formatarHorario(horario)}
												</button>
											);
										})}
									</div>
								)}
							</div>

							{error ? <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div> : null}
							{success ? <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{success}</div> : null}

							<button
								type="submit"
								disabled={submitting}
								className="w-full rounded-xl bg-slate-900 px-4 py-4 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
							>
								{submitting ? "Confirmando agendamento..." : "Confirmar agendamento"}
							</button>
						</form>
					)}
				</section>

				<aside className="space-y-6">
					<section className="rounded-2xl bg-white/10 p-6 shadow-xl backdrop-blur-sm">
						<h2 className="text-xl font-bold">Resumo</h2>
						<div className="mt-5 space-y-4 text-sm text-slate-200">
							<div>
								<p className="text-slate-400">Barbeiro</p>
								<p className="mt-1 font-semibold text-white">{barbeiroSelecionado?.nome || "Nenhum selecionado"}</p>
							</div>
							<div>
								<p className="text-slate-400">Data</p>
								<p className="mt-1 font-semibold text-white">{form.data || "Nenhuma selecionada"}</p>
							</div>
							<div>
								<p className="text-slate-400">Horário</p>
								<p className="mt-1 font-semibold text-white">
									{form.data_hora_inicio ? formatarHorario(form.data_hora_inicio) : "Nenhum selecionado"}
								</p>
							</div>
							<div>
								<p className="text-slate-400">Duração do slot</p>
								<p className="mt-1 font-semibold text-white">60 minutos</p>
							</div>
							<div>
								<p className="text-slate-400">Valor estimado</p>
								<p className="mt-1 text-2xl font-bold text-white">{formatarMoeda(valorTotal)}</p>
							</div>
						</div>
					</section>

					<section className="rounded-2xl bg-white p-6 text-slate-900 shadow-xl">
						<h2 className="text-xl font-bold">Regras da agenda</h2>
						<ul className="mt-4 space-y-3 text-sm text-slate-600">
							<li>Os horários mostrados já respeitam funcionamento da barbearia.</li>
							<li>Os horários também respeitam a disponibilidade configurada para o barbeiro.</li>
							<li>Cada reserva ocupa um bloco fixo de 60 minutos.</li>
							<li>Não é possível reservar um horário que já tenha conflito para o mesmo barbeiro.</li>
						</ul>
					</section>
				</aside>
			</main>
		</div>
	);
}
