import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { Agendamento } from "../entities/Agendamento";
import { AgendamentoService } from "../services/AgendamentoService";

export class AgendamentoClienteController {
  constructor(private readonly agendamentoService: AgendamentoService = new AgendamentoService()) {}

  async create(req: Request, res: Response): Promise<Response> {
    try {
      const { barbearia_id, barbeiro_id, servico_ids, data_hora_inicio } = req.body;
      const cliente_id = (req as any).user?.id;

      if (!cliente_id || !barbearia_id || !barbeiro_id || !servico_ids || !data_hora_inicio) {
        return res.status(400).json({
          message: "Campos obrigatórios: barbearia_id, barbeiro_id, servico_ids, data_hora_inicio",
        });
      }

      const resultado = await this.agendamentoService.criarAgendamento({
        cliente_id: Number(cliente_id),
        barbearia_id: Number(barbearia_id),
        barbeiro_id: Number(barbeiro_id),
        servico_ids: (servico_ids as any[]).map(Number),
        data_hora_inicio,
      });

      if ("erro" in resultado) {
        return res.status(resultado.status).json({ message: resultado.erro });
      }

      return res.status(201).json({
        message: "Agendamento realizado com sucesso",
        agendamento: resultado.agendamento,
      });
    } catch (error) {
      return res.status(500).json({
        message: "Erro ao criar agendamento",
        error: (error as Error).message,
      });
    }
  }

  async getMyAppointments(req: Request, res: Response): Promise<Response> {
    try {
      const cliente_id = (req as any).user?.id;
      if (!cliente_id) {
        return res.status(401).json({ message: "Usuário não autenticado" });
      }

      const agendamentoRepository = AppDataSource.getRepository(Agendamento);
      const agendamentos = await agendamentoRepository.find({
        where: { cliente_id: Number(cliente_id) },
        relations: ["barbearia", "barbeiro", "itens"],
        order: { data_hora_inicio: "DESC" },
      });

      return res.status(200).json({ agendamentos });
    } catch (error) {
      return res.status(500).json({
        message: "Erro ao buscar agendamentos",
        error: (error as Error).message,
      });
    }
  }

  async cancel(req: Request, res: Response): Promise<Response> {
    try {
      const cliente_id = (req as any).user?.id;
      const agendamentoId = Number(req.params.id);

      if (!cliente_id) {
        return res.status(401).json({ message: "Usuário não autenticado" });
      }

      if (!agendamentoId || Number.isNaN(agendamentoId)) {
        return res.status(400).json({ message: "ID do agendamento inválido" });
      }

      const resultado = await this.agendamentoService.cancelarAgendamento(agendamentoId, Number(cliente_id));

      if ("erro" in resultado) {
        return res.status(resultado.status).json({ message: resultado.erro });
      }

      return res.status(200).json({
        message: "Agendamento cancelado com sucesso",
        agendamento: resultado.agendamento,
      });
    } catch (error) {
      return res.status(500).json({
        message: "Erro ao cancelar agendamento",
        error: (error as Error).message,
      });
    }
  }

  async getAvailableSlots(req: Request, res: Response): Promise<Response> {
    try {
      const { barbearia_id, barbeiro_id, data } = req.query;

      if (!barbearia_id || !barbeiro_id || !data) {
        return res.status(400).json({
          message: "Parâmetros obrigatórios: barbearia_id, barbeiro_id, data",
        });
      }

      const resultado = await this.agendamentoService.getSlotsDisponiveis(
        Number(barbearia_id),
        Number(barbeiro_id),
        String(data)
      );

      if ("erro" in resultado) {
        return res.status(resultado.status).json({ message: resultado.erro });
      }

      return res.status(200).json({
        horarios: resultado.horarios,
        intervalo_base: resultado.intervalo_base,
      });
    } catch (error) {
      return res.status(500).json({
        message: "Erro ao buscar horários disponíveis",
        error: (error as Error).message,
      });
    }
  }

  async checkAvailability(req: Request, res: Response): Promise<Response> {
    try {
      const { barbearia_id, barbeiro_id, data_hora_inicio } = req.query;

      if (!barbearia_id || !barbeiro_id || !data_hora_inicio) {
        return res.status(400).json({
          message: "Parâmetros obrigatórios: barbearia_id, barbeiro_id, data_hora_inicio",
        });
      }

      const inicio = new Date(String(data_hora_inicio));
      if (Number.isNaN(inicio.getTime())) {
        return res.status(400).json({ message: "data_hora_inicio inválida" });
      }

      const data = inicio.toISOString().slice(0, 10);
      const resultado = await this.agendamentoService.getSlotsDisponiveis(
        Number(barbearia_id),
        Number(barbeiro_id),
        data
      );

      if ("erro" in resultado) {
        return res.status(resultado.status).json({ message: resultado.erro });
      }

      const disponivel = resultado.horarios.includes(inicio.toISOString());
      return res.status(200).json({ disponivel, data_hora_inicio: inicio.toISOString() });
    } catch (error) {
      return res.status(500).json({
        message: "Erro ao verificar disponibilidade",
        error: (error as Error).message,
      });
    }
  }
}