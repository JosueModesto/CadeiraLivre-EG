import { Router } from "express";
import { UsuarioController } from "../controllers/UsuarioController";

const router = Router();
const usuarioController = new UsuarioController();

// Rota para criar um novo usuário
router.post("/", (req, res) => usuarioController.create(req, res));

// Rota para listar todos os usuários
router.get("/", (req, res) => usuarioController.getAll(req, res));

// Rota para obter um usuário por ID
router.get("/:id", (req, res) => usuarioController.getById(req, res));

// Rota para atualizar um usuário por ID
router.put("/:id", (req, res) => usuarioController.update(req, res));

export default router;
