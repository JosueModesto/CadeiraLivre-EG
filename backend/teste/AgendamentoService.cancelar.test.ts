import { beforeEach, describe, expect, it, jest } from '@jest/globals';

// Mocka o TypeORM pra não precisar do banco verdadeiro
await jest.unstable_mockModule('typeorm', () => ({
  Between: jest.fn(),
  In: jest.fn(),
  Repository: class {},
}));

await jest.unstable_mockModule('../src/padrao/singleton', () => ({
  DatabaseSingleton: {
    getInstance: () => ({
      getRepository: jest.fn(),
    }),
  },
}));

await jest.unstable_mockModule('../src/entities/Agendamento', () => ({
  StatusAgendamento: {
    AGENDADO: 'agendado',
    CONCLUIDO: 'concluido',
    CANCELADO: 'cancelado',
  },
  Agendamento: class {},
}));

await jest.unstable_mockModule('../src/entities/AgendamentoItem', () => ({ AgendamentoItem: class {} }));
await jest.unstable_mockModule('../src/entities/Barbearia', () => ({ Barbearia: class {} }));
await jest.unstable_mockModule('../src/entities/BarbeariaFuncionamento', () => ({ BarbeariaFuncionamento: class {} }));
await jest.unstable_mockModule('../src/entities/BarbeariaServico', () => ({ BarbeariaServico: class {} }));
await jest.unstable_mockModule('../src/entities/Barbeiro', () => ({ Barbeiro: class {} }));
await jest.unstable_mockModule('../src/entities/BarbeiroDisponibilidade', () => ({ BarbeiroDisponibilidade: class {} }));

// Mocka o service auxiliar de disponibilidade só pra não interferir no teste
await jest.unstable_mockModule('../src/services/AgendamentoDisponibilidadeService', () => ({
  AgendamentoDisponibilidadeService: class {
    static DURACAO_PADRAO_MINUTOS = 60;
    somarMinutos(data: Date, minutos: number) {
      return new Date(data.getTime() + minutos * 60000);
    }
    validarJanelaFuncionamento() {
      return null;
    }
    temConflito() {
      return false;
    }
    gerarSlotsDisponiveis() {
      return [];
    }
  },
}));

const { AgendamentoService } = await import('../src/services/AgendamentoService');
const { StatusAgendamento } = await import('../src/entities/Agendamento');

// Monta um agendamento de exemplo, trocando só o status conforme o cenário do teste
function criarAgendamentoDeTeste(status: string) {
  return {
    id: 1,
    cliente_id: 10,
    barbearia_id: 20,
    barbeiro_id: 30,
    data_hora_inicio: new Date('2026-07-01T10:00:00.000Z'),
    data_hora_fim: new Date('2026-07-01T11:00:00.000Z'),
    valor_total: '30.00',
    status,
    criado_em: new Date('2026-07-01T09:00:00.000Z'),
  };
}

describe('AgendamentoService.cancelarAgendamento', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  //Testa se o agendamento pode ser cancelado quando ele não existe
  it('retorna 404 quando o agendamento nao existe', async () => {
    const agendamentoRepo = {
      findOne: jest.fn().mockResolvedValue(null),
      save: jest.fn(),
    };

    const service = new AgendamentoService(
      undefined as any,
      agendamentoRepo as any,
      {} as any,
      {} as any,
      {} as any,
      {} as any,
      {} as any,
      {} as any
    );

    const resultado = await service.cancelarAgendamento(1, 10);

    expect(resultado).toEqual({ erro: 'Agendamento não encontrado', status: 404 });
    expect(agendamentoRepo.save).not.toHaveBeenCalled();
  });

  //Testa se o agendamento pode ser cancelado quando ele já está cancelado
  it('retorna 400 quando o agendamento ja esta cancelado', async () => {
    const agendamentoRepo = {
      findOne: jest.fn().mockResolvedValue(criarAgendamentoDeTeste(StatusAgendamento.CANCELADO)),
      save: jest.fn(),
    };

    const service = new AgendamentoService(
      undefined as any,
      agendamentoRepo as any,
      {} as any,
      {} as any,
      {} as any,
      {} as any,
      {} as any,
      {} as any
    );

    const resultado = await service.cancelarAgendamento(1, 10);

    expect(resultado).toEqual({ erro: 'Este agendamento já foi cancelado', status: 400 });
    expect(agendamentoRepo.save).not.toHaveBeenCalled();
  });

  //Testa se o agendamento pode ser cancelado quando ele está em status diferente de AGENDADO
  it('retorna 400 quando o agendamento nao esta agendado', async () => {
    const agendamentoRepo = {
      findOne: jest.fn().mockResolvedValue(criarAgendamentoDeTeste(StatusAgendamento.CONCLUIDO)),
      save: jest.fn(),
    };

    const service = new AgendamentoService(
      undefined as any,
      agendamentoRepo as any,
      {} as any,
      {} as any,
      {} as any,
      {} as any,
      {} as any,
      {} as any
    );

    const resultado = await service.cancelarAgendamento(1, 10);

    expect(resultado).toEqual({ erro: 'Este agendamento não pode ser cancelado', status: 400 });
    expect(agendamentoRepo.save).not.toHaveBeenCalled();
  });

  //Testa se o agendamento pode ser cancelado quando ele está em status AGENDADO
  it('cancela o agendamento quando ele esta agendado', async () => {
    const agendamento = criarAgendamentoDeTeste(StatusAgendamento.AGENDADO);

    const agendamentoRepo = {
      findOne: jest.fn().mockResolvedValue(agendamento),
      save: jest.fn(async (item) => item),
    };

    const service = new AgendamentoService(
      undefined as any,
      agendamentoRepo as any,
      {} as any,
      {} as any,
      {} as any,
      {} as any,
      {} as any,
      {} as any
    );

    const resultado = await service.cancelarAgendamento(1, 10);

    // O service deve ter alterado o status do objeto original
    expect(agendamento.status).toBe(StatusAgendamento.CANCELADO);
    expect(agendamentoRepo.save).toHaveBeenCalledWith(agendamento);
    expect(resultado).toEqual({ agendamento, status: 200 });
  });
});