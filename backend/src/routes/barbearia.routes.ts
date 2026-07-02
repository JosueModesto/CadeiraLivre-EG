import { Router } from "express";
import { BarbeariaController } from "../controllers/BarbeariaController";
import { AgendamentoBarbeariaController } from "../controllers/AgendamentoBarbeariaController";
import { authenticateToken } from "../middlewares/auth.middleware";

const router = Router();
const barbeariaController = new BarbeariaController();
const agendamentoBarbeariaController = new AgendamentoBarbeariaController();
// Rota para criar uma nova barbearia
router.post("/", (req, res) => barbeariaController.create(req, res));

// Rota para listar todas as barbearias
router.get("/", (req, res) => barbeariaController.getAll(req, res));

// Rota para obter uma barbearia por ID
router.get("/:id", (req, res) => barbeariaController.getById(req, res));

// Rota para obter a configuração de agendamento de uma barbearia
router.get("/:id/agendamento-config", authenticateToken, (req, res) =>
	agendamentoBarbeariaController.getFuncionamento(req as any, res)
);
// Rota para obter os agendamentos do dia de uma barbearia
router.get("/:id/agendamentos", authenticateToken, (req, res) =>
	agendamentoBarbeariaController.getAgendamentosDoDia(req as any, res)
);
// Rota para obter os próximos agendamentos de uma barbearia
router.get("/:id/agendamentos/proximos", authenticateToken, (req, res) =>
	agendamentoBarbeariaController.getProximosAgendamentos(req as any, res)
);
// Rota para cancelar um agendamento de uma barbearia
router.patch("/:id/agendamentos/:agendamentoId/cancel", authenticateToken, (req, res) =>
	agendamentoBarbeariaController.cancelAgendamento(req as any, res)
);

// Rota para atualizar o funcionamento de uma barbearia
router.put("/:id/funcionamento", authenticateToken, (req, res) =>
	agendamentoBarbeariaController.setFuncionamento(req as any, res)
);

// Rota para atualizar o intervalo de uma barbearia
router.put("/:id/intervalo", authenticateToken, (req, res) =>
	agendamentoBarbeariaController.setIntervalo(req as any, res)
);
// Rota para atualizar o tempo de duração de um serviço de uma barbearia
router.put("/:id", (req, res) => barbeariaController.update(req, res));

// Rota para deletar uma barbearia
router.delete("/:id", (req, res) => barbeariaController.delete(req, res));

export default router;
