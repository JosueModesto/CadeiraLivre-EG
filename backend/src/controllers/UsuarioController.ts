import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { AppDataSource } from "../data-source";
import { Usuario } from "../entities/Usuario";

export class UsuarioController {
  async create(req: Request, res: Response): Promise<Response> {
    try {
      const { nome, email, senha, telefone, tipo_usuario, cidade_id } = req.body;

      if (!nome || !email || !senha || !telefone || !tipo_usuario) {
        return res.status(400).json({
          message: "Campos obrigatórios faltando",
        });
      }

      if (senha.length < 6) {
        return res.status(400).json({
          message: "Senha deve ter no mínimo 6 caracteres",
        });
      }

      const usuarioRepository = AppDataSource.getRepository(Usuario);

      const usuarioExistente = await usuarioRepository.findOne({
        where: { email },
      });

      if (usuarioExistente) {
        return res.status(409).json({
          message: "Email já cadastrado",
        });
      }

      const senhaHash = await bcrypt.hash(senha, 10);

      const novoUsuario = usuarioRepository.create({
        nome,
        email,
        senha: senhaHash,
        telefone,
        tipo_usuario,
        cidade_id: cidade_id || null,
      });

      const usuarioSalvo = await usuarioRepository.save(novoUsuario);

      const { senha: _, ...usuarioSemSenha } = usuarioSalvo;

      return res.status(201).json({
        message: "Usuário criado com sucesso!",
        usuario: usuarioSemSenha,
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
      const usuarioRepository = AppDataSource.getRepository(Usuario);
      const usuarios = await usuarioRepository.find({
        select: ["id", "nome", "email", "telefone", "tipo_usuario", "cidade_id", "criado_em"],
      });

      return res.status(200).json({
        usuarios,
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

      const usuarioRepository = AppDataSource.getRepository(Usuario);
      const usuario = await usuarioRepository.findOne({
        where: { id: Number(id) },
        select: ["id", "nome", "email", "telefone", "tipo_usuario", "cidade_id", "criado_em"],
      });

      if (!usuario) {
        return res.status(404).json({
          message: "Usuário não encontrado",
        });
      }

      return res.status(200).json(usuario);
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
      const { nome, telefone, tipo_usuario, cidade_id, senha } = req.body;

      const usuarioRepository = AppDataSource.getRepository(Usuario);
      const usuario = await usuarioRepository.findOne({
        where: { id: Number(id) },
      });

      if (!usuario) {
        return res.status(404).json({
          message: "Usuário não encontrado",
        });
      }

      // Validar senha se for atualizada
      if (senha && senha.length < 6) {
        return res.status(400).json({
          message: "Senha deve ter no mínimo 6 caracteres",
        });
      }

      // Atualizar campos
      if (nome) usuario.nome = nome;
      if (telefone) usuario.telefone = telefone;
      if (tipo_usuario) usuario.tipo_usuario = tipo_usuario;
      if (cidade_id !== undefined) usuario.cidade_id = cidade_id;
      if (senha) usuario.senha = await bcrypt.hash(senha, 10);

      const usuarioAtualizado = await usuarioRepository.save(usuario);

      const { senha: _, ...usuarioSemSenha } = usuarioAtualizado;

      return res.status(200).json({
        message: "Usuário atualizado com sucesso!",
        usuario: usuarioSemSenha,
      });
    } catch (error: any) {
      return res.status(500).json({
        message: "Erro interno no servidor",
        error: error.message,
      });
    }
  }
}
