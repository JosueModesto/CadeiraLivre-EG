import { Router } from "express";
import { UsuarioController } from "../controllers/UsuarioController";

const router = Router();
const usuarioController = new UsuarioController();

router.post("/", (req, res) => usuarioController.create(req, res));

router.get("/", (req, res) => usuarioController.getAll(req, res));

router.get("/:id", (req, res) => usuarioController.getById(req, res));

router.put("/:id", (req, res) => usuarioController.update(req, res));

export default router;
