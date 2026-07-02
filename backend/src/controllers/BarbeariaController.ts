import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { Barbearia } from "../entities/Barbearia";

export class BarbeariaController {
  async create(req: Request, res: Response): Promise<Response> {
    const { usuario_id, nome_comercial, telefone_comercial, endereco, cidade_id, descricao } = req.body;

    if (!usuario_id || !nome_comercial || !endereco || !cidade_id) {
      return res.status(400).json({
        message: "Campos obrigatórios faltando",
      });
    }

    try {
      const barbeariaRepository = AppDataSource.getRepository(Barbearia);
      const novaBarbearia = barbeariaRepository.create({
        usuario_id,
        nome_comercial,
        telefone_comercial: telefone_comercial || null,
        endereco,
        cidade_id,
        descricao: descricao || "",
      });

      const barbeariaSalva = await barbeariaRepository.save(novaBarbearia);

      return res.status(201).json({
        message: "Barbearia criada com sucesso!",
        barbearia: barbeariaSalva,
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
      const { cidade_id, usuario_id } = req.query;
      const barbeariaRepository = AppDataSource.getRepository(Barbearia);

      let query = barbeariaRepository
        .createQueryBuilder("barbearia")
        .leftJoinAndSelect("barbearia.cidade", "cidade")
        .loadRelationCountAndMap("barbearia.total_servicos", "barbearia.servicos");

      if (cidade_id) {
        query = query.where("barbearia.cidade_id = :cidade_id", {
          cidade_id: Number(cidade_id),
        });
      }

      if (usuario_id) {
        query = cidade_id
          ? query.andWhere("barbearia.usuario_id = :usuario_id", {
              usuario_id: Number(usuario_id),
            })
          : query.where("barbearia.usuario_id = :usuario_id", {
              usuario_id: Number(usuario_id),
            });
      }

      const barbearias = await query
        .select([
          "barbearia.id",
          "barbearia.usuario_id",
          "barbearia.nome_comercial",
          "barbearia.telefone_comercial",
          "barbearia.endereco",
          "barbearia.cidade_id",
          "barbearia.descricao",
          "cidade.id",
          "cidade.nome",
          "cidade.estado",
        ])
        .getMany();

      return res.status(200).json({
        barbearias,
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

      const barbeariaRepository = AppDataSource.getRepository(Barbearia);
      const barbearia = await barbeariaRepository.findOne({
        where: { id: Number(id) },
        relations: ["cidade"],
        select: [
          "id",
          "usuario_id",
          "nome_comercial",
          "telefone_comercial",
          "endereco",
          "cidade_id",
          "descricao",
          "cidade",
        ],
      });

      if (!barbearia) {
        return res.status(404).json({
          message: "Barbearia não encontrada",
        });
      }

      return res.status(200).json({
        barbearia,
      });
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
      const { nome_comercial, telefone_comercial, endereco, cidade_id, descricao } = req.body;

      const barbeariaRepository = AppDataSource.getRepository(Barbearia);
      const barbearia = await barbeariaRepository.findOne({
        where: { id: Number(id) },
      });

      if (!barbearia) {
        return res.status(404).json({
          message: "Barbearia não encontrada",
        });
      }

      if (nome_comercial) barbearia.nome_comercial = nome_comercial;
      if (telefone_comercial !== undefined) {
        barbearia.telefone_comercial = telefone_comercial || null;
      }
      if (endereco) barbearia.endereco = endereco;
      if (cidade_id !== undefined) barbearia.cidade_id = cidade_id;
      if (descricao !== undefined) barbearia.descricao = descricao;

      const barbeariaUpdated = await barbeariaRepository.save(barbearia);

      return res.status(200).json({
        message: "Barbearia atualizada com sucesso!",
        barbearia: barbeariaUpdated,
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

      const barbeariaRepository = AppDataSource.getRepository(Barbearia);
      const barbearia = await barbeariaRepository.findOne({
        where: { id: Number(id) },
      });

      if (!barbearia) {
        return res.status(404).json({
          message: "Barbearia não encontrada",
        });
      }

      await barbeariaRepository.remove(barbearia);

      return res.status(200).json({
        message: "Barbearia deletada com sucesso!",
      });
    } catch (error: any) {
      return res.status(500).json({
        message: "Erro interno no servidor",
        error: error.message,
      });
    }
  }

}
