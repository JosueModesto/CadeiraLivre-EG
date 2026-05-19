export type StatusAgendamentoModel = "agendado" | "concluido" | "cancelado";

export interface AgendamentoModel {
  id: number;
  cliente_id: number;
  barbearia_id: number;
  barbeiro_id: number;
  data_hora_inicio: Date;
  data_hora_fim: Date;
  valor_total: string;
  status: StatusAgendamentoModel;
  criado_em: Date;
}
