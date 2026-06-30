import { Router } from "express";
import { BarbeariaController } from "../controllers/BarbeariaController";
import { AgendamentoBarbeariaController } from "../controllers/AgendamentoBarbeariaController";
import { authenticateToken } from "../middlewares/auth.middleware";

const router = Router();
const barbeariaController = new BarbeariaController();
const agendamentoBarbeariaController = new AgendamentoBarbeariaController();

router.post("/", (req, res) => barbeariaController.create(req, res));

router.get("/", (req, res) => barbeariaController.getAll(req, res));

router.get("/:id", (req, res) => barbeariaController.getById(req, res));

router.get("/:id/agendamento-config", authenticateToken, (req, res) =>
	agendamentoBarbeariaController.getFuncionamento(req as any, res)
);

router.get("/:id/agendamentos", authenticateToken, (req, res) =>
	agendamentoBarbeariaController.getAgendamentosDoDia(req as any, res)
);

router.get("/:id/agendamentos/proximos", authenticateToken, (req, res) =>
	agendamentoBarbeariaController.getProximosAgendamentos(req as any, res)
);

router.put("/:id/funcionamento", authenticateToken, (req, res) =>
	agendamentoBarbeariaController.setFuncionamento(req as any, res)
);

router.put("/:id/intervalo", authenticateToken, (req, res) =>
	agendamentoBarbeariaController.setIntervalo(req as any, res)
);

router.put("/:id", (req, res) => barbeariaController.update(req, res));

router.delete("/:id", (req, res) => barbeariaController.delete(req, res));

export default router;
