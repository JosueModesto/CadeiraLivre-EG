import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { Cidade } from "../entities/Cidade";


export class CidadeController{
    async create(req: Request, res: Response): Promise<Response> {
        const { nome, estado} = req.body;
        
        if (!nome || !estado) {
            return res.status(400).json({
                message: "Campos obrigatórios faltando",
            });
        }

        try {
            const cidadeRepository = AppDataSource.getRepository(Cidade);
            const novaCidade = cidadeRepository.create({
                nome, 
                estado: estado.toUpperCase()
            });
            
            const cidadeSalva = await cidadeRepository.save(novaCidade);
            return res.status(201).json({
                message: "Cidade criada com sucesso!",
            });
        } catch (error: any) {
            return res.status(500).json({
                message: 'Erro interno no Servidor',
                error: error.message,
            });

        }
    }

    async getAll(req: Request, res: Response): Promise<Response> {
        try {
        const cidadeRepository = AppDataSource.getRepository(Cidade);
        const cidades = await cidadeRepository.find({
            select: ["id", "nome", "estado"],
        });

        return res.status(200).json({
            cidades,
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

      const cidadeRepository = AppDataSource.getRepository(Cidade);
      const cidade = await cidadeRepository.findOne({
        where: { id: Number(id) },
        select: {
        id: true,
        nome: true,
        estado: true,
        usuarios: {
            id: true,
            nome: true, 
        },
        barbearias: {
            id: true,
            nome: true,
        }
        }
      });

      if (!cidade) {
        return res.status(404).json({
          message: "Cidade não encontrada",
        });
      }

      return res.status(200).json(cidade);
    } catch (error: any) {
      return res.status(500).json({
        message: "Erro interno no servidor",
        error: error.message,
      });
    }
  }
}