import { Router } from "express";
import { BarbeariaServicoController } from "../controllers/BarbeariaServicoController";

const router = Router();
const barbeariaServicoController = new BarbeariaServicoController();

router.post("/", (req, res) => barbeariaServicoController.create(req, res));

router.get("/", (req, res) => barbeariaServicoController.getAll(req, res));

router.get("/:id", (req, res) => barbeariaServicoController.getById(req, res));

router.put("/:id", (req, res) => barbeariaServicoController.update(req, res));

router.delete("/:id", (req, res) => barbeariaServicoController.delete(req, res));

export default router;
