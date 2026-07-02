import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { DatabaseSingleton } from "../padrao/singleton";
import { TipoUsuario, Usuario } from "../entities/Usuario";

const db = DatabaseSingleton.getInstance();

const JWT_SECRET = process.env.JWT_SECRET || "chave_secreta_barbearia_123";

export class AuthController {
  //Método para registrar um novo usuário
  async register(req: Request, res: Response): Promise<Response> {
    try {
      const { nome, email, senha, telefone, endereco, tipo_usuario, cidade_id } = req.body;

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

      const tiposPermitidosCadastro = [TipoUsuario.CLIENTE, TipoUsuario.BARBEARIA];
      if (!tiposPermitidosCadastro.includes(tipo_usuario)) {
        return res.status(403).json({
          message: "Tipo de usuário inválido para cadastro público",
        });
      }

      const usuarioRepository = db.getRepository(Usuario);

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
        endereco: endereco || null,
        tipo_usuario,
        cidade_id: cidade_id || null,
      });

      const usuarioSalvo = await usuarioRepository.save(novoUsuario);

      return res.status(201).json({
        id: usuarioSalvo.id,
        nome: usuarioSalvo.nome,
        email: usuarioSalvo.email,
        telefone: usuarioSalvo.telefone,
        endereco: usuarioSalvo.endereco,
        tipo_usuario: usuarioSalvo.tipo_usuario,
        cidade_id: usuarioSalvo.cidade_id,
        criado_em: usuarioSalvo.criado_em,
      });
    } catch (error: any) {
      return res.status(500).json({
        message: "Erro interno no servidor",
        error: error.message,
      });
    }
  }

  //Método para autenticar um usuário
  async login(req: Request, res: Response): Promise<Response> {
    try {
      const { email } = req.body;
      const senha = req.body.senha ?? req.body.password;

      if (!email || !senha) {
        return res.status(400).json({
          message: "Campos obrigatórios faltando",
        });
      }

      const usuarioRepository = db.getRepository(Usuario);

      const usuario = await usuarioRepository
        .createQueryBuilder("usuario")
        .addSelect("usuario.senha")
        .where("usuario.email = :email", { email })
        .getOne();

      if (!usuario) {
        return res.status(401).json({
          message: "Credenciais inválidas",
        });
      }

      const senhaCorreta = await bcrypt.compare(senha, usuario.senha);

      if (!senhaCorreta) {
        return res.status(401).json({
          message: "Credenciais inválidas",
        });
      }

      const token = jwt.sign(
        {
          id: usuario.id,
          userId: usuario.id,
          tipo_usuario: usuario.tipo_usuario,
        },
        JWT_SECRET,
        { expiresIn: "1d" }
      );

      return res.status(200).json({
        token,
        user: {
          id: usuario.id,
          nome: usuario.nome,
          email: usuario.email,
          telefone: usuario.telefone,
          endereco: usuario.endereco,
          tipo_usuario: usuario.tipo_usuario,
          cidade_id: usuario.cidade_id,
        },
      });
    } catch (error: any) {
      return res.status(500).json({
        message: "Erro interno no servidor",
        error: error.message,
      });
    }
  }
}

