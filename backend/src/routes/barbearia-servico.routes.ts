import { Router } from "express";
import { ServicoController } from "../controllers/ServicoController";

const router = Router();
const barbeariaServicoController = new ServicoController();

router.post("/", (req, res) => barbeariaServicoController.create(req, res));

router.get("/", (req, res) => barbeariaServicoController.getAll(req, res));

router.get("/:id", (req, res) => barbeariaServicoController.getById(req, res));

router.put("/:id", (req, res) => barbeariaServicoController.update(req, res));

router.delete("/:id", (req, res) => barbeariaServicoController.delete(req, res));

export default router;
