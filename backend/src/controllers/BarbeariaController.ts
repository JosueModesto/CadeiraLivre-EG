import { Request, Response } from "express";
import { DatabaseSingleton } from "../padrao/singleton";
import { Barbearia } from "../entities/Barbearia";
import { telefoneSomenteNumeros } from "../utils/validation";

const db = DatabaseSingleton.getInstance();

export class BarbeariaController {
  //Método para criar uma nova barbearia
  async create(req: Request, res: Response): Promise<Response> {
    const { usuario_id, nome_comercial, telefone_comercial, endereco, cidade_id, descricao } = req.body;

    if (!usuario_id || !nome_comercial || !endereco || !cidade_id) {
      return res.status(400).json({
        message: "Campos obrigatórios faltando",
      });
    }

    if (telefone_comercial && !telefoneSomenteNumeros(telefone_comercial)) {
      return res.status(400).json({
        message: "Telefone comercial deve conter apenas números",
      });
    }

    try {
      const barbeariaRepository = db.getRepository(Barbearia);
      const novaBarbearia = barbeariaRepository.create({
        usuario_id,
        nome_comercial,
        telefone_comercial: telefone_comercial ? String(telefone_comercial).trim() : null,
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
  //Método para obter todas as barbearias, com filtros opcionais por cidade e usuário
  async getAll(req: Request, res: Response): Promise<Response> {
    try {
      const { cidade_id, usuario_id } = req.query;
      const barbeariaRepository = db.getRepository(Barbearia);

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

  //Método para obter uma barbearia pelo ID
  async getById(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;

      const barbeariaRepository = db.getRepository(Barbearia);
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
  //Método para atualizar os detalhes de uma barbearia
  async update(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const { nome_comercial, telefone_comercial, endereco, cidade_id, descricao } = req.body;

      const barbeariaRepository = db.getRepository(Barbearia);
      const barbearia = await barbeariaRepository.findOne({
        where: { id: Number(id) },
      });

      if (!barbearia) {
        return res.status(404).json({
          message: "Barbearia não encontrada",
        });
      }

      if (telefone_comercial && !telefoneSomenteNumeros(telefone_comercial)) {
        return res.status(400).json({
          message: "Telefone comercial deve conter apenas números",
        });
      }

      if (nome_comercial) barbearia.nome_comercial = nome_comercial;
      if (telefone_comercial !== undefined) {
        barbearia.telefone_comercial = telefone_comercial ? String(telefone_comercial).trim() : null;
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
  //Método para deletar uma barbearia
  async delete(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;

      const barbeariaRepository = db.getRepository(Barbearia);
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

