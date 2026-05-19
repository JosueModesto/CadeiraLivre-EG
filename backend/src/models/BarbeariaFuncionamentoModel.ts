export interface BarbeariaFuncionamentoModel {
  id: number;
  barbearia_id: number;
  dia_semana: number;
  hora_abertura?: string;
  hora_fechamento?: string;
  esta_aberto: boolean;
}
