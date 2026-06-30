import { Router } from "express";
import { BarbeiroController } from "../controllers/BarbeiroController";
import { authenticateToken } from "../middlewares/auth.middleware";

const router = Router();
const barbeiroController = new BarbeiroController();

router.post("/", (req, res) => barbeiroController.create(req, res));

router.get("/", (req, res) => barbeiroController.getAll(req, res));

router.get("/:id", (req, res) => barbeiroController.getById(req, res));

router.get("/:id/disponibilidade", (req, res) => barbeiroController.getDisponibilidade(req, res));

router.put("/:id/disponibilidade", authenticateToken, (req, res) =>
	barbeiroController.setDisponibilidade(req as any, res)
);

router.put("/:id", (req, res) => barbeiroController.update(req, res));

router.delete("/:id", (req, res) => barbeiroController.delete(req, res));

export default router;
