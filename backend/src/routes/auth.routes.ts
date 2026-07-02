import jwt from "jsonwebtoken";
import { Router } from "express";
import bcrypt from "bcryptjs";
import { Usuario } from "../entities/Usuario";
import { AuthController } from "../controllers/AuthController";

const router = Router();
const authController = new AuthController();

const JWT_SECRET = process.env.JWT_SECRET || "chave_secreta_barbearia_123";
// Rota para registro de usuário
router.post("/register", (req, res) => authController.register(req, res));
// Rota para login de usuário
router.post("/login", (req, res) => authController.login(req, res));

export default router;

