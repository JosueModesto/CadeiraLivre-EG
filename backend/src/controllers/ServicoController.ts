import { Request, Response } from "express";
import { IsNull } from "typeorm";
import { DatabaseSingleton } from "../padrao/singleton";
import { BarbeariaServico } from "../entities/BarbeariaServico";
import { Barbearia } from "../entities/Barbearia";
import { TipoUsuario } from "../entities/Usuario";
import { AuthRequest } from "../middlewares/auth.middleware";

const db = DatabaseSingleton.getInstance();

export class ServicoController {
	async create(req: AuthRequest, res: Response): Promise<Response> {
		if (!req.user) {
			return res.status(401).json({
				message: "Usuário não autenticado",
			});
		}

		const servicoRepository = db.getRepository(BarbeariaServico);

		try {
			if (req.user.tipo_usuario === TipoUsuario.ADMINISTRADOR) {
				const { nome_servico, preco, duracao_min } = req.body;

				if (!nome_servico || !preco || !duracao_min) {
					return res.status(400).json({
						message: "Campos obrigatórios faltando",
					});
				}

				const novoServico = servicoRepository.create({
					barbearia_id: null,
					nome_servico,
					preco,
					duracao_min,
					ativo: true,
				});

				const servicoSalvo = await servicoRepository.save(novoServico);
				return res.status(201).json({
					message: "Serviço criado com sucesso!",
					servico: servicoSalvo,
				});
			}

			if (req.user.tipo_usuario !== TipoUsuario.BARBEARIA) {
				return res.status(403).json({
					message: "Acesso negado",
				});
			}

			const { servico_id, barbearia_id, preco } = req.body;
			if (!servico_id || !preco) {
				return res.status(400).json({
					message: "Campos obrigatórios faltando",
				});
			}

			const barbeariaRepository = db.getRepository(Barbearia);
			const barbearia = await barbeariaRepository.findOne({
				where: { usuario_id: req.user.id },
			});

			if (!barbearia) {
				return res.status(404).json({
					message: "Barbearia não encontrada para este usuário",
				});
			}

			if (barbearia_id && Number(barbearia_id) !== barbearia.id) {
				return res.status(403).json({
					message: "Você só pode adicionar serviços à sua própria barbearia",
				});
			}

			const servicoBase = await servicoRepository.findOne({
					where: { id: Number(servico_id), barbearia_id: IsNull(), ativo: true },
			});

			if (!servicoBase) {
				return res.status(404).json({
					message: "Serviço base não encontrado",
				});
			}

			const servicoExistente = await servicoRepository.findOne({
				where: {
					barbearia_id: barbearia.id,
					nome_servico: servicoBase.nome_servico,
				},
			});

			if (servicoExistente) {
				servicoExistente.preco = preco;
				servicoExistente.ativo = true;
				const reativado = await servicoRepository.save(servicoExistente);
				return res.status(200).json({
					message: "Este serviço já foi adicionado à sua barbearia",
					servico: reativado,
				});
			}

			const novoServico = servicoRepository.create({
				barbearia_id: barbearia.id,
				nome_servico: servicoBase.nome_servico,
				preco,
				duracao_min: servicoBase.duracao_min,
				ativo: true,
			});

			const servicoSalvo = await servicoRepository.save(novoServico);
			return res.status(201).json({
				message: "Serviço adicionado à barbearia com sucesso!",
				servico: servicoSalvo,
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
			const { barbearia_id, global } = req.query;
			const servicoRepository = db.getRepository(BarbeariaServico);
			
			let query = servicoRepository.createQueryBuilder("servico");
			
			if (barbearia_id) {
				query = query.where("servico.barbearia_id = :barbearia_id", {
					barbearia_id: Number(barbearia_id),
				});
			} else if (String(global) === "true" || !global) {
				query = query.where("servico.barbearia_id IS NULL").andWhere("servico.ativo = true");
			}

			if (barbearia_id) {
				query = query.andWhere("servico.ativo = true");
			}
			
			const servicos = await query.select([
				"servico.id",
				"servico.barbearia_id",
				"servico.nome_servico",
				"servico.preco",
				"servico.duracao_min",
			]).getMany();

			return res.status(200).json({
				servicos,
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

			const servicoRepository = db.getRepository(BarbeariaServico);
			const servico = await servicoRepository.findOne({
				where: { id: Number(id) },
				select: ["id", "barbearia_id", "nome_servico", "preco", "duracao_min"],
			});

			if (!servico) {
				return res.status(404).json({
					message: "Serviço não encontrado",
				});
			}

			return res.status(200).json(servico);
		} catch (error: any) {
			return res.status(500).json({
				message: "Erro interno no servidor",
				error: error.message,
			});
		}
	}

	async update(req: AuthRequest, res: Response): Promise<Response> {
		try {
			const { id } = req.params;
			const { nome_servico, preco, duracao_min } = req.body;

			const servicoRepository = db.getRepository(BarbeariaServico);
			const servico = await servicoRepository.findOne({
				where: { id: Number(id) },
				relations: ["barbearia"],
			});

			if (!servico) {
				return res.status(404).json({
					message: "Serviço não encontrado",
				});
			}

			if (!req.user) {
				return res.status(401).json({
					message: "Usuário não autenticado",
				});
			}

			if (req.user.tipo_usuario === TipoUsuario.ADMINISTRADOR) {
				if (servico.barbearia_id !== null) {
					return res.status(403).json({
						message: "O administrador só pode editar o catálogo global",
					});
				}

				if (nome_servico !== undefined) servico.nome_servico = nome_servico;
				if (preco !== undefined) servico.preco = preco;
				if (duracao_min !== undefined) servico.duracao_min = duracao_min;
			} else if (req.user.tipo_usuario === TipoUsuario.BARBEARIA) {
				const barbeariaRepository = db.getRepository(Barbearia);
				const barbearia = await barbeariaRepository.findOne({
					where: { usuario_id: req.user.id },
				});

				if (!barbearia || servico.barbearia_id !== barbearia.id) {
					return res.status(403).json({
						message: "Você só pode alterar os serviços da sua barbearia",
					});
				}

				if (preco === undefined) {
					return res.status(400).json({
						message: "Informe o preço do serviço",
					});
				}

				servico.preco = preco;
				servico.ativo = true;
			} else {
				return res.status(403).json({
					message: "Acesso negado",
				});
			}

			const servicoAtualizado = await servicoRepository.save(servico);

			return res.status(200).json({
				message: "Serviço atualizado com sucesso!",
				servico: servicoAtualizado,
			});
		} catch (error: any) {
			return res.status(500).json({
				message: "Erro interno no servidor",
				error: error.message,
			});
		}
	}

	async delete(req: AuthRequest, res: Response): Promise<Response> {
		try {
			const { id } = req.params;

			const servicoRepository = db.getRepository(BarbeariaServico);
			const servico = await servicoRepository.findOne({
				where: { id: Number(id) },
			});

			if (!servico) {
				return res.status(404).json({
					message: "Serviço não encontrado",
				});
			}

			if (!req.user) {
				return res.status(401).json({
					message: "Usuário não autenticado",
				});
			}

			if (req.user.tipo_usuario === TipoUsuario.ADMINISTRADOR) {
				if (servico.barbearia_id !== null) {
					return res.status(403).json({
						message: "O administrador só pode excluir o catálogo global",
					});
				}
				servico.ativo = false;
			} else if (req.user.tipo_usuario === TipoUsuario.BARBEARIA) {
				const barbeariaRepository = db.getRepository(Barbearia);
				const barbearia = await barbeariaRepository.findOne({
					where: { usuario_id: req.user.id },
				});

				if (!barbearia || servico.barbearia_id !== barbearia.id) {
					return res.status(403).json({
						message: "Você só pode remover serviços da sua barbearia",
					});
				}
				servico.ativo = false;
			} else {
				return res.status(403).json({
					message: "Acesso negado",
				});
			}

			await servicoRepository.save(servico);

			return res.status(200).json({
				message: "Serviço excluído com sucesso!",
			});
		} catch (error: any) {
			return res.status(500).json({
				message: "Erro interno no servidor",
				error: error.message,
			});
		}
	}
}


