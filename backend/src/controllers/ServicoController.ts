import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { BarbeariaServico } from "../entities/BarbeariaServico";

export class ServicoController {
	async create(req: Request, res: Response): Promise<Response> {
		const { barbearia_id, nome_servico, preco, duracao_min } = req.body;

		if (!barbearia_id || !nome_servico || !preco || !duracao_min) {
			return res.status(400).json({
				message: "Campos obrigatórios faltando",
			});
		}

		try {
			const servicoRepository = AppDataSource.getRepository(BarbeariaServico);
			const novoServico = servicoRepository.create({
				barbearia_id,
				nome_servico,
				preco,
				duracao_min,
			});

			const servicoSalvo = await servicoRepository.save(novoServico);

			return res.status(201).json({
				message: "Serviço criado com sucesso!",
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
			const { barbearia_id } = req.query;
			const servicoRepository = AppDataSource.getRepository(BarbeariaServico);
			
			let query = servicoRepository.createQueryBuilder("servico");
			
			if (barbearia_id) {
				query = query.where("servico.barbearia_id = :barbearia_id", {
					barbearia_id: Number(barbearia_id),
				});
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

			const servicoRepository = AppDataSource.getRepository(BarbeariaServico);
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

	async update(req: Request, res: Response): Promise<Response> {
		try {
			const { id } = req.params;
			const { barbearia_id, nome_servico, preco, duracao_min } = req.body;

			const servicoRepository = AppDataSource.getRepository(BarbeariaServico);
			const servico = await servicoRepository.findOne({
				where: { id: Number(id) },
			});

			if (!servico) {
				return res.status(404).json({
					message: "Serviço não encontrado",
				});
			}

			if (barbearia_id !== undefined) servico.barbearia_id = barbearia_id;
			if (nome_servico) servico.nome_servico = nome_servico;
			if (preco) servico.preco = preco;
			if (duracao_min !== undefined) servico.duracao_min = duracao_min;

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

	async delete(req: Request, res: Response): Promise<Response> {
		try {
			const { id } = req.params;

			const servicoRepository = AppDataSource.getRepository(BarbeariaServico);
			const servico = await servicoRepository.findOne({
				where: { id: Number(id) },
			});

			if (!servico) {
				return res.status(404).json({
					message: "Serviço não encontrado",
				});
			}

			await servicoRepository.remove(servico);

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

