export interface Janela {
  hora_abertura: string; // "HH:mm"
  hora_fechamento: string; // "HH:mm"
}

export interface AgendamentoExistente {
  data_hora_inicio: Date;
  data_hora_fim: Date;
}

export class AgendamentoDisponibilidadeService {

  static readonly DURACAO_PADRAO_MINUTOS = 60;
  // Método para obter os minutos de uma data
  obterMinutosDaData(data: Date): number {
    return data.getHours() * 60 + data.getMinutes();
  }
  // Método para obter os minutos de uma hora no formato "HH:mm"
  obterMinutosDaHora(hora: string): number {
    const [horaNumero, minutoNumero] = hora.split(":").map(Number);
    return horaNumero * 60 + minutoNumero;
  }
  // Método para somar minutos a uma data
  somarMinutos(dataBase: Date, minutos: number): Date {
    return new Date(dataBase.getTime() + minutos * 60000);
  }

  // Método para validar se um intervalo de tempo está dentro das janelas de funcionamento
  validarJanelaFuncionamento(janelas: Janela[], inicio: Date, fim: Date): string | null {
    if (!janelas || janelas.length === 0) {
      return "A barbearia no atende neste dia";
    }

    const inicioMin = this.obterMinutosDaData(inicio);
    const fimMin = this.obterMinutosDaData(fim);

    const estaDentroDeAlgumaJanela = janelas.some((janela) => {
      const aberturaMin = this.obterMinutosDaHora(janela.hora_abertura);
      const fechamentoMin = this.obterMinutosDaHora(janela.hora_fechamento);
      return inicioMin >= aberturaMin && fimMin <= fechamentoMin;
    });

    if (!estaDentroDeAlgumaJanela) {
      return "Horrio fora dos intervalos de funcionamento da barbearia";
    }

    return null;
  }
  // Método para verificar se um horário de início e duração está alinhado com os slots disponíveis
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

  // Método para verificar se há conflito entre agendamentos existentes e um novo horário
  temConflito(agendamentos: AgendamentoExistente[], inicio: Date, fim: Date): boolean {
    return agendamentos.some(
      (agendamento) =>
        inicio < agendamento.data_hora_fim && fim > agendamento.data_hora_inicio
    );
  }

  // Método para gerar os slots disponíveis para agendamento com base nas janelas de funcionamento e agendamentos existentes
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