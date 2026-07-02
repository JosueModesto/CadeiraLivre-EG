import { Router } from "express";
import { BarbeiroController } from "../controllers/BarbeiroController";
import { authenticateToken } from "../middlewares/auth.middleware";

const router = Router();
const barbeiroController = new BarbeiroController();
// Rota para criar um novo barbeiro
router.post("/", (req, res) => barbeiroController.create(req, res));

// Rota para listar todos os barbeiros
router.get("/", (req, res) => barbeiroController.getAll(req, res));

// Rota para obter um barbeiro por ID
router.get("/:id", (req, res) => barbeiroController.getById(req, res));

// Rota para atualizar um barbeiro por ID
router.get("/:id/disponibilidade", (req, res) => barbeiroController.getDisponibilidade(req, res));

// Rota para atualizar a disponibilidade de um barbeiro
router.put("/:id/disponibilidade", authenticateToken, (req, res) =>
	barbeiroController.setDisponibilidade(req as any, res)
);

// Rota para atualizar um barbeiro por ID
router.put("/:id", (req, res) => barbeiroController.update(req, res));

// Rota para deletar um barbeiro por ID
router.delete("/:id", (req, res) => barbeiroController.delete(req, res));

export default router;
