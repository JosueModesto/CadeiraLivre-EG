import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { TipoUsuario } from "../entities/Usuario";

const JWT_SECRET = process.env.JWT_SECRET || "chave_secreta_barbearia_123";

export interface AuthRequest extends Request {
  user?: {
    id: number;
    userId: number;
    tipo_usuario: TipoUsuario;
  };
}
// Middleware para autenticação de token JWT
export function authenticateToken(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void {
  const authHeader = req.headers.authorization;
  const token = authHeader?.split(" ")[1];

  if (!token) {
    res.status(401).json({
      message: "Token não encontrado",
    });
    return;
  }

  try {
    const user = jwt.verify(token, JWT_SECRET) as {
      id: number;
      userId: number;
      tipo_usuario: TipoUsuario;
    };
    req.user = user;
    next();
  } catch (error) {
    res.status(403).json({
      message: "Token inválido ou expirado",
    });
  }
}
// Middleware para verificar se o usuário é administrador
export function requireAdmin(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void {
  if (!req.user) {
    res.status(401).json({
      message: "Usuário não autenticado",
    });
    return;
  }

  if (req.user.tipo_usuario !== TipoUsuario.ADMINISTRADOR) {
    res.status(403).json({
      message: "Acesso restrito ao administrador",
    });
    return;
  }

  next();
}
