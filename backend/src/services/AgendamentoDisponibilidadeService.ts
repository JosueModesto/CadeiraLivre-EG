/**
 * Lógica pura de disponibilidade de horários.
 *
 * Esta classe NÃO acessa banco de dados nem repositórios do TypeORM.
 * Ela recebe os dados já carregados (janelas de funcionamento e agendamentos
 * já existentes) e devolve cálculos determinísticos. Isso permite testar
 * 100% das regras de negócio com testes de unidade rápidos, sem mocks de DB.
 */

export interface Janela {
  hora_abertura: string; // "HH:mm"
  hora_fechamento: string; // "HH:mm"
}

export interface AgendamentoExistente {
  data_hora_inicio: Date;
  data_hora_fim: Date;
}

export class AgendamentoDisponibilidadeService {
  /** Duração fixa de cada slot de agendamento, em minutos.
   *  Esse valor é independente da duração dos serviços escolhidos pelo cliente. */
  static readonly DURACAO_PADRAO_MINUTOS = 60;

  obterMinutosDaData(data: Date): number {
    return data.getHours() * 60 + data.getMinutes();
  }

  obterMinutosDaHora(hora: string): number {
    const [horaNumero, minutoNumero] = hora.split(":").map(Number);
    return horaNumero * 60 + minutoNumero;
  }

  somarMinutos(dataBase: Date, minutos: number): Date {
    return new Date(dataBase.getTime() + minutos * 60000);
  }

  /**
   * Verifica se o intervalo [inicio, fim) está contido em alguma das janelas
   * de funcionamento do dia. Retorna null se válido, ou uma mensagem de erro.
   */
  validarJanelaFuncionamento(janelas: Janela[], inicio: Date, fim: Date): string | null {
    if (!janelas || janelas.length === 0) {
      return "A barbearia não atende neste dia";
    }

    const inicioMin = this.obterMinutosDaData(inicio);
    const fimMin = this.obterMinutosDaData(fim);

    const estaDentroDeAlgumaJanela = janelas.some((janela) => {
      const aberturaMin = this.obterMinutosDaHora(janela.hora_abertura);
      const fechamentoMin = this.obterMinutosDaHora(janela.hora_fechamento);
      return inicioMin >= aberturaMin && fimMin <= fechamentoMin;
    });

    if (!estaDentroDeAlgumaJanela) {
      return "Horário fora dos intervalos de funcionamento da barbearia";
    }

    return null;
  }

  /**
   * Valida se o horário de início pertence à grade de slots da barbearia
   * para a duração informada.
   */
  estaNoGridDeSlots(janelas: Janela[], inicio: Date, duracaoMinutos: number): boolean {
    const inicioMin = this.obterMinutosDaData(inicio);
    const fimMin = inicioMin + duracaoMinutos;

    return janelas.some((janela) => {
      const aberturaMin = this.obterMinutosDaHora(janela.hora_abertura);
      const fechamentoMin = this.obterMinutosDaHora(janela.hora_fechamento);

      if (inicioMin < aberturaMin || fimMin > fechamentoMin) {
        return false;
      }

      return (inicioMin - aberturaMin) % duracaoMinutos === 0;
    });
  }

  /**
   * Verifica se [inicio, fim) conflita com algum agendamento já existente
   * (sobreposição de intervalos).
   */
  temConflito(agendamentos: AgendamentoExistente[], inicio: Date, fim: Date): boolean {
    return agendamentos.some(
      (agendamento) =>
        inicio < agendamento.data_hora_fim && fim > agendamento.data_hora_inicio
    );
  }

  /**
   * Gera todos os slots de horário possíveis dentro das janelas de
   * funcionamento de um dia, com duração fixa, excluindo os que já têm
   * conflito com agendamentos existentes.
   */
  gerarSlotsDisponiveis(
    data: string, // "YYYY-MM-DD"
    janelas: Janela[],
    agendamentosExistentes: AgendamentoExistente[],
    duracaoMinutos: number = AgendamentoDisponibilidadeService.DURACAO_PADRAO_MINUTOS
  ): Date[] {
    const slots: Date[] = [];

    for (const janela of janelas) {
      const aberturaMin = this.obterMinutosDaHora(janela.hora_abertura);
      const fechamentoMin = this.obterMinutosDaHora(janela.hora_fechamento);

      for (
        let currentMin = aberturaMin;
        currentMin + duracaoMinutos <= fechamentoMin;
        currentMin += duracaoMinutos
      ) {
        const hour = String(Math.floor(currentMin / 60)).padStart(2, "0");
        const minute = String(currentMin % 60).padStart(2, "0");
        const inicio = new Date(`${data}T${hour}:${minute}:00`);
        const fim = this.somarMinutos(inicio, duracaoMinutos);

        if (!this.temConflito(agendamentosExistentes, inicio, fim)) {
          slots.push(inicio);
        }
      }
    }

    return slots;
  }
}