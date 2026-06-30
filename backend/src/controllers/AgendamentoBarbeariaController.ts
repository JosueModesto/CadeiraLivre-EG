import { Response } from "express";
import { Between, MoreThanOrEqual } from "typeorm";
import { AppDataSource } from "../data-source";
import { Agendamento, StatusAgendamento } from "../entities/Agendamento";
import { Barbearia } from "../entities/Barbearia";
import { BarbeariaFuncionamento } from "../entities/BarbeariaFuncionamento";
import { AuthRequest } from "../middlewares/auth.middleware";
import { AgendamentoDisponibilidadeService } from "../services/AgendamentoDisponibilidadeService";

type FuncionamentoInput = {
  dia_semana: number;
  esta_aberto: boolean;
  hora_abertura?: string;
  hora_fechamento?: string;
};

export class AgendamentoBarbeariaController {
  private readonly barbeariaRepo = AppDataSource.getRepository(Barbearia);
  private readonly funcionamentoRepo = AppDataSource.getRepository(BarbeariaFuncionamento);
  private readonly agendamentoRepo = AppDataSource.getRepository(Agendamento);

  private async obterBarbeariaDoUsuario(barbeariaId: number, usuarioId: number) {
    return this.barbeariaRepo.findOne({ where: { id: barbeariaId, usuario_id: usuarioId } });
  }

  private validarHorario(horario?: string): boolean {
    if (!horario) return false;
    return /^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/.test(horario);
  }

  private normalizarRegistrosEntrada(body: any): FuncionamentoInput[] {
    if (Array.isArray(body?.funcionamento)) {
      return body.funcionamento;
    }

    if (Array.isArray(body)) {
      return body;
    }

    if (body?.dia_semana !== undefined) {
      return [body as FuncionamentoInput];
    }

    return [];
  }

  async getFuncionamento(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const barbeariaId = Number(req.params.id);
      const usuarioId = Number(req.user?.id || req.user?.userId);

      if (!usuarioId) {
        return res.status(401).json({ message: "Usuário não autenticado" });
      }

      const barbearia = await this.obterBarbeariaDoUsuario(barbeariaId, usuarioId);
      if (!barbearia) {
        return res.status(404).json({ message: "Barbearia não encontrada para este usuário" });
      }

      const funcionamento = await this.funcionamentoRepo.find({
        where: { barbearia_id: barbearia.id },
        order: { dia_semana: "ASC" },
      });

      return res.status(200).json({
        barbearia_id: barbearia.id,
        intervalo_base: AgendamentoDisponibilidadeService.DURACAO_PADRAO_MINUTOS,
        funcionamento,
      });
    } catch (error) {
      return res.status(500).json({
        message: "Erro ao buscar configuração de funcionamento",
        error: (error as Error).message,
      });
    }
  }

  async setFuncionamento(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const barbeariaId = Number(req.params.id);
      const usuarioId = Number(req.user?.id || req.user?.userId);

      if (!usuarioId) {
        return res.status(401).json({ message: "Usuário não autenticado" });
      }

      const barbearia = await this.obterBarbeariaDoUsuario(barbeariaId, usuarioId);
      if (!barbearia) {
        return res.status(404).json({ message: "Barbearia não encontrada para este usuário" });
      }

      const registros = this.normalizarRegistrosEntrada(req.body);
      if (registros.length === 0) {
        return res.status(400).json({
          message:
            "Informe ao menos um registro de funcionamento (campo funcionamento[] ou dia_semana/esta_aberto)",
        });
      }

      for (const registro of registros) {
        const diaSemana = Number(registro.dia_semana);
        const estaAberto = Boolean(registro.esta_aberto);

        if (!Number.isInteger(diaSemana) || diaSemana < 0 || diaSemana > 6) {
          return res.status(400).json({
            message: "dia_semana deve ser um inteiro entre 0 (domingo) e 6 (sábado)",
          });
        }

        if (estaAberto) {
          if (!this.validarHorario(registro.hora_abertura) || !this.validarHorario(registro.hora_fechamento)) {
            return res.status(400).json({
              message: "Para dia aberto, hora_abertura e hora_fechamento devem estar no formato HH:mm",
            });
          }

          const aberturaMin = this.converterHoraEmMinutos(registro.hora_abertura!);
          const fechamentoMin = this.converterHoraEmMinutos(registro.hora_fechamento!);
          if (aberturaMin >= fechamentoMin) {
            return res.status(400).json({
              message: "hora_abertura deve ser menor que hora_fechamento",
            });
          }
        }

        const existente = await this.funcionamentoRepo.findOne({
          where: { barbearia_id: barbearia.id, dia_semana: diaSemana },
        });

        const entidade = existente ?? this.funcionamentoRepo.create({ barbearia_id: barbearia.id, dia_semana: diaSemana });
        entidade.esta_aberto = estaAberto;
        entidade.hora_abertura = estaAberto ? this.normalizarHoraParaBanco(registro.hora_abertura!) : null as any;
        entidade.hora_fechamento = estaAberto ? this.normalizarHoraParaBanco(registro.hora_fechamento!) : null as any;

        await this.funcionamentoRepo.save(entidade);
      }

      const funcionamentoAtualizado = await this.funcionamentoRepo.find({
        where: { barbearia_id: barbearia.id },
        order: { dia_semana: "ASC" },
      });

      return res.status(200).json({
        message: "Funcionamento atualizado com sucesso",
        barbearia_id: barbearia.id,
        funcionamento: funcionamentoAtualizado,
      });
    } catch (error) {
      return res.status(500).json({
        message: "Erro ao atualizar funcionamento",
        error: (error as Error).message,
      });
    }
  }

  async setIntervalo(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const barbeariaId = Number(req.params.id);
      const usuarioId = Number(req.user?.id || req.user?.userId);
      const intervalo = Number(req.body?.intervalo_base);

      if (!usuarioId) {
        return res.status(401).json({ message: "Usuário não autenticado" });
      }

      const barbearia = await this.obterBarbeariaDoUsuario(barbeariaId, usuarioId);
      if (!barbearia) {
        return res.status(404).json({ message: "Barbearia não encontrada para este usuário" });
      }

      if (!Number.isFinite(intervalo)) {
        return res.status(400).json({ message: "intervalo_base é obrigatório" });
      }

      if (intervalo !== AgendamentoDisponibilidadeService.DURACAO_PADRAO_MINUTOS) {
        return res.status(400).json({
          message: "O intervalo de agendamento é fixo em 60 minutos",
        });
      }

      barbearia.intervalo_base = AgendamentoDisponibilidadeService.DURACAO_PADRAO_MINUTOS;
      await this.barbeariaRepo.save(barbearia);

      return res.status(200).json({
        message: "Intervalo configurado com sucesso",
        intervalo_base: barbearia.intervalo_base,
      });
    } catch (error) {
      return res.status(500).json({
        message: "Erro ao atualizar intervalo",
        error: (error as Error).message,
      });
    }
  }

  async getAgendamentosDoDia(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const barbeariaId = Number(req.params.id);
      const usuarioId = Number(req.user?.id || req.user?.userId);
      const barbeiroId = Number(req.query.barbeiro_id);
      const data = String(req.query.data || "");

      if (!usuarioId) {
        return res.status(401).json({ message: "Usuário não autenticado" });
      }

      if (!barbeiroId || !data) {
        return res.status(400).json({ message: "Parâmetros obrigatórios: barbeiro_id e data" });
      }

      const barbearia = await this.obterBarbeariaDoUsuario(barbeariaId, usuarioId);
      if (!barbearia) {
        return res.status(404).json({ message: "Barbearia não encontrada para este usuário" });
      }

      const diaInicio = new Date(`${data}T00:00:00`);
      const diaFim = new Date(`${data}T23:59:59.999`);

      const agendamentos = await this.agendamentoRepo.find({
        where: {
          barbearia_id: barbearia.id,
          barbeiro_id: barbeiroId,
          data_hora_inicio: Between(diaInicio, diaFim),
        },
        relations: ["cliente", "barbeiro", "itens"],
        order: { data_hora_inicio: "ASC" },
      });

      return res.status(200).json({ agendamentos });
    } catch (error) {
      return res.status(500).json({
        message: "Erro ao buscar agenda do barbeiro",
        error: (error as Error).message,
      });
    }
  }

  async getProximosAgendamentos(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const barbeariaId = Number(req.params.id);
      const usuarioId = Number(req.user?.id || req.user?.userId);
      const data = req.query.data ? String(req.query.data) : null;

      if (!usuarioId) {
        return res.status(401).json({ message: "Usuário não autenticado" });
      }

      const barbearia = await this.obterBarbeariaDoUsuario(barbeariaId, usuarioId);
      if (!barbearia) {
        return res.status(404).json({ message: "Barbearia não encontrada para este usuário" });
      }

      const agora = new Date();
      const inicioReferencia = data ? new Date(`${data}T00:00:00`) : agora;
      const referencia = inicioReferencia > agora ? inicioReferencia : agora;

      const agendamentosFuturos = await this.agendamentoRepo.find({
        where: {
          barbearia_id: barbearia.id,
          status: StatusAgendamento.AGENDADO,
          data_hora_inicio: MoreThanOrEqual(referencia),
        },
        relations: ["cliente", "barbeiro", "itens"],
        order: { data_hora_inicio: "ASC" },
      });

      if (agendamentosFuturos.length === 0) {
        return res.status(200).json({ agendamentos: [] });
      }

      const primeiroHorario = new Date(agendamentosFuturos[0].data_hora_inicio);
      const diaInicio = new Date(primeiroHorario);
      diaInicio.setHours(0, 0, 0, 0);
      const diaFim = new Date(primeiroHorario);
      diaFim.setHours(23, 59, 59, 999);

      const agendamentos = await this.agendamentoRepo.find({
        where: {
          barbearia_id: barbearia.id,
          status: StatusAgendamento.AGENDADO,
          data_hora_inicio: Between(diaInicio, diaFim),
        },
        relations: ["cliente", "barbeiro", "itens"],
        order: { data_hora_inicio: "ASC" },
      });

      return res.status(200).json({ agendamentos });
    } catch (error) {
      return res.status(500).json({
        message: "Erro ao buscar próximos agendamentos",
        error: (error as Error).message,
      });
    }
  }

  private normalizarHoraParaBanco(hora: string): string {
    const [h, m] = hora.split(":");
    return `${h.padStart(2, "0")}:${m.padStart(2, "0")}:00`;
  }

  private converterHoraEmMinutos(hora: string): number {
    const [h, m] = hora.split(":").map(Number);
    return h * 60 + m;
  }
}