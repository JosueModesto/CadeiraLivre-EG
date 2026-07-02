import { Router } from "express";
import { ServicoController } from "../controllers/ServicoController";
import { authenticateToken } from "../middlewares/auth.middleware";

const router = Router();
const servicoController = new ServicoController();

router.post("/", authenticateToken, (req, res) => servicoController.create(req as any, res));

router.get("/", (req, res) => servicoController.getAll(req, res));

router.get("/:id", (req, res) => servicoController.getById(req, res));

router.put("/:id", authenticateToken, (req, res) => servicoController.update(req as any, res));

router.delete("/:id", authenticateToken, (req, res) => servicoController.delete(req as any, res));

export default router;
