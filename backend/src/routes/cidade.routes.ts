import { Router } from "express";
import { CidadeController } from "../controllers/CidadeController";
import { authenticateToken, requireAdmin } from "../middlewares/auth.middleware";

const router = Router();
const cidadeController = new CidadeController();
// Rota para criar uma nova cidade
router.post("/", authenticateToken, requireAdmin, (req, res) =>
	cidadeController.create(req, res)
);

// Rota para listar todas as cidades
router.get("/", (req, res) => cidadeController.getAll(req, res));

// Rota para obter uma cidade por ID
router.get("/:id", (req, res) => cidadeController.getById(req, res));

// Rota para atualizar uma cidade por ID
router.put("/:id", authenticateToken, requireAdmin, (req, res) =>
	cidadeController.update(req, res)
);

// Rota para deletar uma cidade por ID
router.delete("/:id", authenticateToken, requireAdmin, (req, res) =>
	cidadeController.delete(req, res)
);

export default router;
