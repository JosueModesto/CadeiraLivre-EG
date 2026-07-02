import { Between, In, Repository } from "typeorm";
import { DatabaseSingleton } from "../padrao/singleton";
import { Agendamento, StatusAgendamento } from "../entities/Agendamento";
import { AgendamentoItem } from "../entities/AgendamentoItem";
import { Barbearia } from "../entities/Barbearia";
import { BarbeariaFuncionamento } from "../entities/BarbeariaFuncionamento";
import { BarbeariaServico } from "../entities/BarbeariaServico";
import { Barbeiro } from "../entities/Barbeiro";
import { BarbeiroDisponibilidade } from "../entities/BarbeiroDisponibilidade";
import {
  AgendamentoDisponibilidadeService,
  Janela,
} from "./AgendamentoDisponibilidadeService";

const db = DatabaseSingleton.getInstance();

export interface CriarAgendamentoInput {
  cliente_id: number;
  barbearia_id: number;
  barbeiro_id: number;
  servico_ids: number[];
  data_hora_inicio: string | Date;
}

export class AgendamentoService {
  constructor(
    private readonly disponibilidade: AgendamentoDisponibilidadeService = new AgendamentoDisponibilidadeService(),
    private readonly agendamentoRepo: Repository<Agendamento> = db.getRepository(Agendamento),
    private readonly agendamentoItemRepo: Repository<AgendamentoItem> = db.getRepository(AgendamentoItem),
    private readonly barbeariaRepo: Repository<Barbearia> = db.getRepository(Barbearia),
    private readonly funcionamentoRepo: Repository<BarbeariaFuncionamento> = db.getRepository(BarbeariaFuncionamento),
    private readonly servicoRepo: Repository<BarbeariaServico> = db.getRepository(BarbeariaServico),
    private readonly barbeiroRepo: Repository<Barbeiro> = db.getRepository(Barbeiro),
    private readonly barbeiroDisponibilidadeRepo: Repository<BarbeiroDisponibilidade> = db.getRepository(BarbeiroDisponibilidade)
  ) {}

  private obterMinutos(hora: string): number {
    const [h, m] = hora.split(":").map(Number);
    return h * 60 + m;
  }

  private paraHora(min: number): string {
    const h = String(Math.floor(min / 60)).padStart(2, "0");
    const m = String(min % 60).padStart(2, "0");
    return `${h}:${m}:00`;
  }
  // Método para intersectar janelas de funcionamento da barbearia e disponibilidade do barbeiro
  private intersectarJanelas(base: Janela[], restricoes: Janela[]): Janela[] {
    const resultado: Janela[] = [];
    for (const janelaBase of base) {
      const inicioBase = this.obterMinutos(janelaBase.hora_abertura);
      const fimBase = this.obterMinutos(janelaBase.hora_fechamento);

      for (const janelaRestricao of restricoes) {
        const inicioRestricao = this.obterMinutos(janelaRestricao.hora_abertura);
        const fimRestricao = this.obterMinutos(janelaRestricao.hora_fechamento);

        const inicio = Math.max(inicioBase, inicioRestricao);
        const fim = Math.min(fimBase, fimRestricao);

        if (inicio < fim) {
          resultado.push({
            hora_abertura: this.paraHora(inicio),
            hora_fechamento: this.paraHora(fim),
          });
        }
      }
    }

    return resultado;
  }
  // Método para obter as janelas de funcionamento da barbearia e disponibilidade do barbeiro para um determinado dia da semana
  private async obterJanelasDoDia(barbearia_id: number, barbeiro_id: number, diaSemana: number): Promise<Janela[]> {
    const funcionamentos = await this.funcionamentoRepo.find({
      where: { barbearia_id, dia_semana: diaSemana, esta_aberto: true },
      order: { hora_abertura: "ASC" },
    });

    const janelasBarbearia = funcionamentos
      .filter((f) => f.hora_abertura && f.hora_fechamento)
      .map((f) => ({ hora_abertura: f.hora_abertura!, hora_fechamento: f.hora_fechamento! }));

    const disponibilidades = await this.barbeiroDisponibilidadeRepo.find({
      where: { barbeiro_id, dia_semana: diaSemana },
      order: { hora_inicio: "ASC" },
    });

    const temRestricaoAtiva = disponibilidades.some((d) => d.esta_disponivel && d.hora_inicio && d.hora_fim);
    if (!temRestricaoAtiva) {
      return janelasBarbearia;
    }

    const janelasBarbeiro = disponibilidades
      .filter((d) => d.esta_disponivel && d.hora_inicio && d.hora_fim)
      .map((d) => ({ hora_abertura: d.hora_inicio!, hora_fechamento: d.hora_fim! }));

    return this.intersectarJanelas(janelasBarbearia, janelasBarbeiro);
  }
  //Método para obter os agendamentos do barbeiro em um determinado dia, para verificar conflitos de horário
  private async obterAgendamentosDoDia(barbeiro_id: number, inicio: Date) {
    const diaInicio = new Date(inicio);
    diaInicio.setHours(0, 0, 0, 0);
    const diaFim = new Date(inicio);
    diaFim.setHours(23, 59, 59, 999);

    return this.agendamentoRepo.find({
      where: {
        barbeiro_id,
        status: StatusAgendamento.AGENDADO,
        data_hora_inicio: Between(diaInicio, diaFim),
      },
    });
  }

  //Método para criar um novo agendamento
  async criarAgendamento(input: CriarAgendamentoInput) {
    const { cliente_id, barbearia_id, barbeiro_id, servico_ids, data_hora_inicio } = input;

    if (!servico_ids || servico_ids.length === 0) {
      return { erro: "Selecione ao menos um serviço", status: 400 } as const;
    }

    const barbearia = await this.barbeariaRepo.findOne({ where: { id: barbearia_id } });
    if (!barbearia) {
      return { erro: "Barbearia não encontrada", status: 404 } as const;
    }

    const barbeiro = await this.barbeiroRepo.findOne({ where: { id: barbeiro_id, barbearia_id } });
    if (!barbeiro) {
      return { erro: "Barbeiro não encontrado nesta barbearia", status: 404 } as const;
    }

    const servicos = await this.servicoRepo.findBy({ id: In(servico_ids), barbearia_id, ativo: true } as any);
    if (servicos.length !== servico_ids.length) {
      return { erro: "Um ou mais serviços são inválidos para esta barbearia", status: 400 } as const;
    }

    const inicio = new Date(data_hora_inicio);
    const duracao = AgendamentoDisponibilidadeService.DURACAO_PADRAO_MINUTOS;
    const fim = this.disponibilidade.somarMinutos(inicio, duracao);

    const janelas = await this.obterJanelasDoDia(barbearia_id, barbeiro_id, inicio.getDay());
    const erroJanela = this.disponibilidade.validarJanelaFuncionamento(janelas, inicio, fim);
    if (erroJanela) {
      return { erro: erroJanela, status: 400 } as const;
    }

    const agendamentosExistentes = await this.obterAgendamentosDoDia(barbeiro_id, inicio);
    if (this.disponibilidade.temConflito(agendamentosExistentes, inicio, fim)) {
      return { erro: "O horário selecionado já está ocupado", status: 409 } as const;
    }

    const valorTotal = servicos.reduce((soma, s) => soma + Number(s.preco), 0);

    const agendamento = await this.agendamentoRepo.save(
      this.agendamentoRepo.create({
        cliente_id,
        barbearia_id,
        barbeiro_id,
        data_hora_inicio: inicio,
        data_hora_fim: fim,
        valor_total: valorTotal.toFixed(2),
        status: StatusAgendamento.AGENDADO,
      })
    );

    await this.agendamentoItemRepo.save(
      servicos.map((servico) =>
        this.agendamentoItemRepo.create({
          agendamento_id: agendamento.id,
          servico_id: servico.id,
          preco_cobrado: servico.preco,
        })
      )
    );

    const agendamentoCompleto = await this.agendamentoRepo.findOne({
      where: { id: agendamento.id },
      relations: ["barbearia", "barbeiro", "itens"],
    });

    return { agendamento: agendamentoCompleto, status: 201 } as const;
  }
  //Método para cancelar um agendamento feito pelo cliente
  async cancelarAgendamento(agendamentoId: number, clienteId: number) {
    const agendamento = await this.agendamentoRepo.findOne({
      where: { id: agendamentoId, cliente_id: clienteId },
    });

    if (!agendamento) {
      return { erro: "Agendamento não encontrado", status: 404 } as const;
    }

    if (agendamento.status === StatusAgendamento.CANCELADO) {
      return { erro: "Este agendamento já foi cancelado", status: 400 } as const;
    }

    if (agendamento.status !== StatusAgendamento.AGENDADO) {
      return { erro: "Este agendamento não pode ser cancelado", status: 400 } as const;
    }

    agendamento.status = StatusAgendamento.CANCELADO;
    const atualizado = await this.agendamentoRepo.save(agendamento);

    return { agendamento: atualizado, status: 200 } as const;
  }

  async cancelarAgendamentoPorBarbearia(agendamentoId: number, barbeariaId: number) {
    const agendamento = await this.agendamentoRepo.findOne({
      where: { id: agendamentoId, barbearia_id: barbeariaId },
    });

    if (!agendamento) {
      return { erro: "Agendamento não encontrado", status: 404 } as const;
    }

    if (agendamento.status === StatusAgendamento.CANCELADO) {
      return { erro: "Este agendamento já foi cancelado", status: 400 } as const;
    }

    if (agendamento.status !== StatusAgendamento.AGENDADO) {
      return { erro: "Este agendamento não pode ser cancelado", status: 400 } as const;
    }

    agendamento.status = StatusAgendamento.CANCELADO;
    const atualizado = await this.agendamentoRepo.save(agendamento);

    return { agendamento: atualizado, status: 200 } as const;
  }
  //Método para obter os horários disponíveis para agendamento em uma barbearia e barbeiro específicos em uma data específica
  async getSlotsDisponiveis(barbearia_id: number, barbeiro_id: number, data: string) {
    const barbearia = await this.barbeariaRepo.findOne({ where: { id: barbearia_id } });
    if (!barbearia) {
      return { erro: "Barbearia não encontrada", status: 404 } as const;
    }

    const duracao = AgendamentoDisponibilidadeService.DURACAO_PADRAO_MINUTOS;
    const dataReferencia = new Date(`${data}T00:00:00`);

    const janelas = await this.obterJanelasDoDia(barbearia_id, barbeiro_id, dataReferencia.getDay());
    const agendamentosExistentes = await this.obterAgendamentosDoDia(barbeiro_id, dataReferencia);

    const slots = this.disponibilidade.gerarSlotsDisponiveis(
      data,
      janelas,
      agendamentosExistentes,
      duracao
    );

    return { horarios: slots.map((s) => s.toISOString()), intervalo_base: duracao, status: 200 } as const;
  }
}
