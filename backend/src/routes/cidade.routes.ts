import { Router } from "express";
import { CidadeController } from "../controllers/CidadeController";
import { authenticateToken, requireAdmin } from "../middlewares/auth.middleware";

const router = Router();
const cidadeController = new CidadeController();

router.post("/", authenticateToken, requireAdmin, (req, res) =>
	cidadeController.create(req, res)
);

router.get("/", authenticateToken, requireAdmin, (req, res) =>
	cidadeController.getAll(req, res)
);

router.get("/:id", authenticateToken, requireAdmin, (req, res) =>
	cidadeController.getById(req, res)
);

router.put("/:id", authenticateToken, requireAdmin, (req, res) =>
	cidadeController.update(req, res)
);

router.delete("/:id", authenticateToken, requireAdmin, (req, res) =>
	cidadeController.delete(req, res)
);

export default router;
