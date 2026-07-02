import { Router } from "express";
import { AgendamentoClienteController } from "../controllers/AgendamentoClienteController";
import { authenticateToken } from "../middlewares/auth.middleware";

const router = Router();
const agendamentoController = new AgendamentoClienteController();

// Criar novo agendamento 
router.post("/", authenticateToken, (req, res) =>
  agendamentoController.create(req, res)
);

// Verificar disponibilidade de horário
router.get("/check-availability", (req, res) =>
  agendamentoController.checkAvailability(req, res)
);

// Listar horários disponíveis com base no intervalo da barbearia
router.get("/available-slots", (req, res) =>
  agendamentoController.getAvailableSlots(req, res)
);

// Listar agendamentos do usuário 
router.get("/my-appointments", authenticateToken, (req, res) =>
  agendamentoController.getMyAppointments(req, res)
);

// Cancelar agendamento do usuário 
router.patch("/:id/cancel", authenticateToken, (req, res) =>
  agendamentoController.cancel(req, res)
);

export default router;
