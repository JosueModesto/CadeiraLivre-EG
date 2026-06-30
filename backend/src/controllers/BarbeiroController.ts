import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { Barbearia } from "../entities/Barbearia";
import { Barbeiro } from "../entities/Barbeiro";
import { BarbeiroDisponibilidade } from "../entities/BarbeiroDisponibilidade";
import { AuthRequest } from "../middlewares/auth.middleware";

export class BarbeiroController {
	private validarHorario(horario?: string): boolean {
		if (!horario) return false;
		return /^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/.test(horario);
	}

	private normalizarHoraParaBanco(hora: string): string {
		const [h, m] = hora.split(":");
		return `${h.padStart(2, "0")}:${m.padStart(2, "0")}:00`;
	}

	private converterHoraEmMinutos(hora: string): number {
		const [h, m] = hora.split(":").map(Number);
		return h * 60 + m;
	}

	async getDisponibilidade(req: Request, res: Response): Promise<Response> {
		try {
			const barbeiroId = Number(req.params.id);
			const disponibilidadeRepository = AppDataSource.getRepository(BarbeiroDisponibilidade);

			const disponibilidades = await disponibilidadeRepository.find({
				where: { barbeiro_id: barbeiroId },
				order: { dia_semana: "ASC", hora_inicio: "ASC" },
			});

			return res.status(200).json({ barbeiro_id: barbeiroId, disponibilidades });
		} catch (error: any) {
			return res.status(500).json({
				message: "Erro interno no servidor",
				error: error.message,
			});
		}
	}

	async setDisponibilidade(req: AuthRequest, res: Response): Promise<Response> {
		try {
			const barbeiroId = Number(req.params.id);
			const usuarioId = Number(req.user?.id || req.user?.userId);
			if (!usuarioId) {
				return res.status(401).json({ message: "Usuário não autenticado" });
			}

			const barbeiroRepository = AppDataSource.getRepository(Barbeiro);
			const barbeariaRepository = AppDataSource.getRepository(Barbearia);
			const disponibilidadeRepository = AppDataSource.getRepository(BarbeiroDisponibilidade);

			const barbeiro = await barbeiroRepository.findOne({ where: { id: barbeiroId } });
			if (!barbeiro) {
				return res.status(404).json({ message: "Barbeiro não encontrado" });
			}

			const barbearia = await barbeariaRepository.findOne({
				where: { id: barbeiro.barbearia_id, usuario_id: usuarioId },
			});
			if (!barbearia) {
				return res.status(403).json({ message: "Sem permissão para alterar este barbeiro" });
			}

			const registros = Array.isArray(req.body?.disponibilidades)
				? req.body.disponibilidades
				: Array.isArray(req.body)
					? req.body
					: req.body?.dia_semana !== undefined
						? [req.body]
						: [];

			if (registros.length === 0) {
				return res.status(400).json({
					message: "Informe disponibilidades[] ou um objeto com dia_semana/esta_disponivel",
				});
			}

			const porDia = new Map<number, any[]>();
			for (const registro of registros) {
				const diaSemana = Number(registro.dia_semana);
				if (!Number.isInteger(diaSemana) || diaSemana < 0 || diaSemana > 6) {
					return res.status(400).json({ message: "dia_semana deve ser entre 0 e 6" });
				}
				if (!porDia.has(diaSemana)) porDia.set(diaSemana, []);
				porDia.get(diaSemana)!.push(registro);
			}

			for (const [diaSemana, itensDia] of porDia.entries()) {
				const entidades: BarbeiroDisponibilidade[] = [];
				const intervalos: Array<{ inicio: number; fim: number }> = [];

				for (const item of itensDia) {
					const estaDisponivel = Boolean(item.esta_disponivel);
					if (!estaDisponivel) {
						continue;
					}

					if (!this.validarHorario(item.hora_inicio) || !this.validarHorario(item.hora_fim)) {
						return res.status(400).json({
							message: "hora_inicio e hora_fim devem estar no formato HH:mm",
						});
					}

					const inicioMin = this.converterHoraEmMinutos(item.hora_inicio);
					const fimMin = this.converterHoraEmMinutos(item.hora_fim);
					if (inicioMin >= fimMin) {
						return res.status(400).json({ message: "hora_inicio deve ser menor que hora_fim" });
					}

					intervalos.push({ inicio: inicioMin, fim: fimMin });
					entidades.push(
						disponibilidadeRepository.create({
							barbeiro_id: barbeiroId,
							dia_semana: diaSemana,
							esta_disponivel: true,
							hora_inicio: this.normalizarHoraParaBanco(item.hora_inicio),
							hora_fim: this.normalizarHoraParaBanco(item.hora_fim),
						})
					);
				}

				intervalos.sort((a, b) => a.inicio - b.inicio);
				for (let i = 1; i < intervalos.length; i++) {
					if (intervalos[i].inicio < intervalos[i - 1].fim) {
						return res.status(400).json({ message: `Intervalos sobrepostos no dia ${diaSemana}` });
					}
				}

				await disponibilidadeRepository.delete({ barbeiro_id: barbeiroId, dia_semana: diaSemana });

				if (entidades.length > 0) {
					await disponibilidadeRepository.save(entidades);
				} else {
					await disponibilidadeRepository.save(
						disponibilidadeRepository.create({
							barbeiro_id: barbeiroId,
							dia_semana: diaSemana,
							esta_disponivel: false,
							hora_inicio: null,
							hora_fim: null,
						})
					);
				}
			}

			const disponibilidadesAtualizadas = await disponibilidadeRepository.find({
				where: { barbeiro_id: barbeiroId },
				order: { dia_semana: "ASC", hora_inicio: "ASC" },
			});

			return res.status(200).json({
				message: "Disponibilidade do barbeiro atualizada com sucesso",
				barbeiro_id: barbeiroId,
				disponibilidades: disponibilidadesAtualizadas,
			});
		} catch (error: any) {
			return res.status(500).json({
				message: "Erro interno no servidor",
				error: error.message,
			});
		}
	}

	async create(req: Request, res: Response): Promise<Response> {
		const { barbearia_id, nome, telefone, ativo } = req.body;

		if (!barbearia_id || !nome || !telefone) {
			return res.status(400).json({
				message: "Campos obrigatórios faltando",
			});
		}

		try {
			const barbeiroRepository = AppDataSource.getRepository(Barbeiro);
			const novoBarbeiro = barbeiroRepository.create({
				barbearia_id,
				nome,
				telefone,
				ativo: ativo ?? true,
			});

			const barbeiroSalvo = await barbeiroRepository.save(novoBarbeiro);

			return res.status(201).json({
				message: "Barbeiro criado com sucesso!",
				barbeiro: barbeiroSalvo,
			});
		} catch (error: any) {
			return res.status(500).json({
				message: "Erro interno no servidor",
				error: error.message,
			});
		}
	}

	async getAll(req: Request, res: Response): Promise<Response> {
		try {
			const { barbearia_id } = req.query;
			const barbeiroRepository = AppDataSource.getRepository(Barbeiro);
			
			let query = barbeiroRepository.createQueryBuilder("barbeiro");
			
			if (barbearia_id) {
				query = query.where("barbeiro.barbearia_id = :barbearia_id", {
					barbearia_id: Number(barbearia_id),
				});
			}
			
			const barbeiros = await query.select([
				"barbeiro.id",
				"barbeiro.barbearia_id",
				"barbeiro.nome",
				"barbeiro.telefone",
				"barbeiro.ativo",
			]).getMany();

			return res.status(200).json({
				barbeiros,
			});
		} catch (error: any) {
			return res.status(500).json({
				message: "Erro interno no servidor",
				error: error.message,
			});
		}
	}

	async getById(req: Request, res: Response): Promise<Response> {
		try {
			const { id } = req.params;

			const barbeiroRepository = AppDataSource.getRepository(Barbeiro);
			const barbeiro = await barbeiroRepository.findOne({
				where: { id: Number(id) },
				select: ["id", "barbearia_id", "nome", "telefone", "ativo"],
			});

			if (!barbeiro) {
				return res.status(404).json({
					message: "Barbeiro não encontrado",
				});
			}

			return res.status(200).json(barbeiro);
		} catch (error: any) {
			return res.status(500).json({
				message: "Erro interno no servidor",
				error: error.message,
			});
		}
	}

	async update(req: Request, res: Response): Promise<Response> {
		try {
			const { id } = req.params;
			const { barbearia_id, nome, telefone, ativo } = req.body;

			const barbeiroRepository = AppDataSource.getRepository(Barbeiro);
			const barbeiro = await barbeiroRepository.findOne({
				where: { id: Number(id) },
			});

			if (!barbeiro) {
				return res.status(404).json({
					message: "Barbeiro não encontrado",
				});
			}

			if (barbearia_id !== undefined) barbeiro.barbearia_id = barbearia_id;
			if (nome) barbeiro.nome = nome;
			if (telefone) barbeiro.telefone = telefone;
			if (ativo !== undefined) barbeiro.ativo = ativo;

			const barbeiroAtualizado = await barbeiroRepository.save(barbeiro);

			return res.status(200).json({
				message: "Barbeiro atualizado com sucesso!",
				barbeiro: barbeiroAtualizado,
			});
		} catch (error: any) {
			return res.status(500).json({
				message: "Erro interno no servidor",
				error: error.message,
			});
		}
	}

	async delete(req: Request, res: Response): Promise<Response> {
		try {
			const { id } = req.params;

			const barbeiroRepository = AppDataSource.getRepository(Barbeiro);
			const barbeiro = await barbeiroRepository.findOne({
				where: { id: Number(id) },
			});

			if (!barbeiro) {
				return res.status(404).json({
					message: "Barbeiro não encontrado",
				});
			}

			await barbeiroRepository.remove(barbeiro);

			return res.status(200).json({
				message: "Barbeiro excluído com sucesso!",
			});
		} catch (error: any) {
			return res.status(500).json({
				message: "Erro interno no servidor",
				error: error.message,
			});
		}
	}
}

