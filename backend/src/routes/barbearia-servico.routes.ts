import { Router } from "express";
import { ServicoController } from "../controllers/ServicoController";

const router = Router();
const barbeariaServicoController = new ServicoController();
// Rota para criar um novo serviço
router.post("/", (req, res) => barbeariaServicoController.create(req, res));

// Rota para listar todos os serviços
router.get("/", (req, res) => barbeariaServicoController.getAll(req, res));

// Rota para obter um serviço por ID
router.get("/:id", (req, res) => barbeariaServicoController.getById(req, res));

// Rota para atualizar um serviço por ID
router.put("/:id", (req, res) => barbeariaServicoController.update(req, res));

// Rota para deletar um serviço por ID
router.delete("/:id", (req, res) => barbeariaServicoController.delete(req, res));

export default router;
