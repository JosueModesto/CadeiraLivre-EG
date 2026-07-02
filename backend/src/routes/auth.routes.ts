import jwt from "jsonwebtoken";
import { Router } from "express";
import bcrypt from "bcryptjs";
import { Usuario } from "../entities/Usuario";
import { AuthController } from "../controllers/AuthController";

const router = Router();
const authController = new AuthController();

const JWT_SECRET = process.env.JWT_SECRET || "chave_secreta_barbearia_123";

router.post("/register", (req, res) => authController.register(req, res));

router.post("/login", (req, res) => authController.login(req, res));

export default router;

