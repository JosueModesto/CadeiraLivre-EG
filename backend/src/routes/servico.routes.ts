import { Router } from "express";
import { ServicoController } from "../controllers/ServicoController";
import { authenticateToken } from "../middlewares/auth.middleware";

const router = Router();
const servicoController = new ServicoController();

// Rota para criar um novo serviço
router.post("/", authenticateToken, (req, res) => servicoController.create(req as any, res));

// Rota para listar todos os serviços
router.get("/", (req, res) => servicoController.getAll(req, res));

// Rota para obter um serviço por ID
router.get("/:id", (req, res) => servicoController.getById(req, res));

// Rota para atualizar um serviço por ID
router.put("/:id", authenticateToken, (req, res) => servicoController.update(req as any, res));

// Rota para deletar um serviço por ID
router.delete("/:id", authenticateToken, (req, res) => servicoController.delete(req as any, res));

export default router;
