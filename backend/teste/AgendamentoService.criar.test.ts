import { beforeEach, describe, expect, it, jest } from '@jest/globals';

// Mocka o TypeORM pra não precisar de banco verdadeiro
await jest.unstable_mockModule('typeorm', () => ({
  Between: jest.fn((inicio, fim) => ({ inicio, fim })),
  In: jest.fn((ids) => ids),
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

describe('AgendamentoService.criarAgendamento', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  //Teste se o agendamento pode ser criado quando nenhum serviço é informado
  it('retorna erro 400 quando nenhum servico e informado', async () => {
    // Aqui nem precisamos de repositorios reais, pois o service
    // deve barrar a requisição antes de acessar o banco
    const service = new AgendamentoService(
      undefined as any,
      undefined as any,
      undefined as any,
      undefined as any,
      undefined as any,
      undefined as any,
      undefined as any,
      undefined as any
    );

    const resultado = await service.criarAgendamento({
      cliente_id: 1,
      barbearia_id: 2,
      barbeiro_id: 3,
      servico_ids: [],
      data_hora_inicio: '2026-07-01T10:00:00.000Z',
    });

    expect(resultado).toEqual({ erro: 'Selecione ao menos um serviço', status: 400 });
  });
  //Teste se o agendamento pode ser criado quando a barbearia não existe
  it('retorna 404 quando a barbearia nao existe', async () => {
    const barbeariaRepo = {
      findOne: jest.fn().mockResolvedValue(null),
    };

    const service = new AgendamentoService(
      undefined as any,
      {} as any,
      {} as any,
      barbeariaRepo as any,
      {} as any,
      {} as any,
      {} as any,
      {} as any
    );

    const resultado = await service.criarAgendamento({
      cliente_id: 1,
      barbearia_id: 999,
      barbeiro_id: 3,
      servico_ids: [10],
      data_hora_inicio: '2026-07-01T10:00:00.000Z',
    });

    expect(resultado).toEqual({ erro: 'Barbearia não encontrada', status: 404 });
  });

  //Teste se o agendamento pode ser criado quando o barbeiro não pertence a barbearia
  it('retorna 404 quando o barbeiro nao pertence a barbearia', async () => {
    const barbeariaRepo = {
      findOne: jest.fn().mockResolvedValue({ id: 2 }),
    };

    const barbeiroRepo = {
      // Simula que o barbeiro não foi encontrado nessa barbearia
      findOne: jest.fn().mockResolvedValue(null),
    };

    const service = new AgendamentoService(
      undefined as any,
      {} as any,
      {} as any,
      barbeariaRepo as any,
      {} as any,
      {} as any,
      barbeiroRepo as any,
      {} as any
    );

    const resultado = await service.criarAgendamento({
      cliente_id: 1,
      barbearia_id: 2,
      barbeiro_id: 999,
      servico_ids: [10],
      data_hora_inicio: '2026-07-01T10:00:00.000Z',
    });

    expect(resultado).toEqual({ erro: 'Barbeiro não encontrado nesta barbearia', status: 404 });
  });

  //Teste se o agendamento pode ser criado quando um dos serviços informados não pertence a barbearia
  it('retorna 400 quando um servico informado e invalido', async () => {
    const barbeariaRepo = {
      findOne: jest.fn().mockResolvedValue({ id: 2 }),
    };

    const barbeiroRepo = {
      findOne: jest.fn().mockResolvedValue({ id: 3, barbearia_id: 2 }),
    };

    const servicoRepo = {
      // Pediu 2 serviços (10 e 999), mas o repo só encontrou 1 válido
      findBy: jest.fn().mockResolvedValue([{ id: 10, barbearia_id: 2, preco: '45.00' }]),
    };

    const service = new AgendamentoService(
      undefined as any,
      {} as any,
      {} as any,
      barbeariaRepo as any,
      {} as any,
      servicoRepo as any,
      barbeiroRepo as any,
      {} as any
    );

    const resultado = await service.criarAgendamento({
      cliente_id: 1,
      barbearia_id: 2,
      barbeiro_id: 3,
      servico_ids: [10, 999],
      data_hora_inicio: '2026-07-01T10:00:00.000Z',
    });

    expect(resultado).toEqual({
      erro: 'Um ou mais serviços são inválidos para esta barbearia',
      status: 400,
    });
  });

  //Teste se o agendamento pode ser criado com sucesso quando todos os dados são válidos
  it('cria o agendamento com sucesso quando os dados sao validos', async () => {
    // Simula o retorno esperado do banco depois de salvar
    const agendamentoSalvo = {
      id: 99,
      cliente_id: 1,
      barbearia_id: 2,
      barbeiro_id: 3,
      data_hora_inicio: new Date('2026-07-01T10:00:00.000Z'),
      data_hora_fim: new Date('2026-07-01T11:00:00.000Z'),
      valor_total: '75.00',
      status: StatusAgendamento.AGENDADO,
    };

    // Cada repositório mockado só precisa responder o que o service usa dele
    const agendamentoRepo = {
      find: jest.fn().mockResolvedValue([]),
      create: jest.fn((payload) => payload),
      save: jest.fn().mockResolvedValue(agendamentoSalvo),
      findOne: jest.fn().mockResolvedValue({ ...agendamentoSalvo, itens: [] }),
    };

    const agendamentoItemRepo = {
      create: jest.fn((payload) => payload),
      save: jest.fn().mockResolvedValue(undefined),
    };

    const barbeariaRepo = {
      findOne: jest.fn().mockResolvedValue({ id: 2 }),
    };

    const barbeiroRepo = {
      findOne: jest.fn().mockResolvedValue({ id: 3, barbearia_id: 2 }),
    };

    const servicoRepo = {
      findBy: jest.fn().mockResolvedValue([
        { id: 10, barbearia_id: 2, preco: '45.00' },
        { id: 11, barbearia_id: 2, preco: '30.00' },
      ]),
    };

    const funcionamentoRepo = {
      find: jest.fn().mockResolvedValue([
        { hora_abertura: '08:00:00', hora_fechamento: '18:00:00', esta_aberto: true },
      ]),
    };

    const barbeiroDisponibilidadeRepo = {
      find: jest.fn().mockResolvedValue([]),
    };

    const service = new AgendamentoService(
      undefined as any,
      agendamentoRepo as any,
      agendamentoItemRepo as any,
      barbeariaRepo as any,
      funcionamentoRepo as any,
      servicoRepo as any,
      barbeiroRepo as any,
      barbeiroDisponibilidadeRepo as any
    );

    const resultado = await service.criarAgendamento({
      cliente_id: 1,
      barbearia_id: 2,
      barbeiro_id: 3,
      servico_ids: [10, 11],
      data_hora_inicio: '2026-07-01T10:00:00.000Z',
    });

    // Verifica se o agendamento foi criado com os dados certos
    expect(agendamentoRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({
        cliente_id: 1,
        barbearia_id: 2,
        barbeiro_id: 3,
        valor_total: '75.00',
        status: StatusAgendamento.AGENDADO,
      })
    );

    // Verifica se os itens do agendamento foram salvos
    expect(agendamentoItemRepo.save).toHaveBeenCalled();

    // Verifica a resposta final do service
    expect(resultado).toEqual({
      agendamento: { ...agendamentoSalvo, itens: [] },
      status: 201,
    });
  });
});