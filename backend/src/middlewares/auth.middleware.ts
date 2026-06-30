import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "chave_secreta_barbearia_123";

export interface AuthRequest extends Request {
  user?: {
    id: number;
    userId: number;
    tipo_usuario: string;
  };
}

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
      tipo_usuario: string;
    };
    req.user = user;
    next();
  } catch (error) {
    res.status(403).json({
      message: "Token inválido ou expirado",
    });
  }
}
