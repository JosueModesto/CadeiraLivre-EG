import { Router } from "express";
import { CidadeController } from "../controllers/CidadeController";

const router = Router();
const cidadeController = new CidadeController();

router.post("/", (req, res) => cidadeController.create(req, res));

router.get("/", (req, res) => cidadeController.getAll(req, res));

router.get("/:id", (req, res) => cidadeController.getById(req, res));

router.put("/:id", (req, res) => cidadeController.update(req, res));

router.delete("/:id", (req, res) => cidadeController.delete(req, res));

export default router;
