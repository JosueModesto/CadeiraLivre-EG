import { Router } from "express";
import { ServicoController } from "../controllers/ServicoController";

const router = Router();
const servicoController = new ServicoController();

router.post("/", (req, res) => servicoController.create(req, res));

router.get("/", (req, res) => servicoController.getAll(req, res));

router.get("/:id", (req, res) => servicoController.getById(req, res));

router.put("/:id", (req, res) => servicoController.update(req, res));

router.delete("/:id", (req, res) => servicoController.delete(req, res));

export default router;
