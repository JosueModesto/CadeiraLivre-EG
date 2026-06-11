import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { Barbeiro } from "../entities/Barbeiro";

export class BarbeiroController {
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
			const barbeiroRepository = AppDataSource.getRepository(Barbeiro);
			const barbeiros = await barbeiroRepository.find({
				select: ["id", "barbearia_id", "nome", "telefone", "ativo"],
			});

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

