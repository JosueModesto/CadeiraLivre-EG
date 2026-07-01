import { pathToFileURL } from "url";
import { AppDataSource } from "./data-source";
import { Cidade } from "./entities/Cidade";
import { Usuario, TipoUsuario } from "./entities/Usuario";
import { Barbearia } from "./entities/Barbearia";
import { BarbeariaFuncionamento } from "./entities/BarbeariaFuncionamento";
import { Barbeiro } from "./entities/Barbeiro";
import { BarbeiroDisponibilidade } from "./entities/BarbeiroDisponibilidade";
import { BarbeariaServico } from "./entities/BarbeariaServico";
import { Agendamento, StatusAgendamento } from "./entities/Agendamento";
import { AgendamentoItem } from "./entities/AgendamentoItem";

async function upsertOne(repository: any, where: any, payload: any) {
  const existing = await repository.findOneBy(where);

  if (existing) {
    repository.merge(existing, payload);
    return repository.save(existing);
  }

  return repository.save(repository.create(payload));
}

async function runSeed(force = false) {
  const shouldRunSeed = force || process.env.DB_RUN_SEED === "true";

  if (!shouldRunSeed) {
    return;
  }

  const cidadeRepository = AppDataSource.getRepository(Cidade);
  const usuarioRepository = AppDataSource.getRepository(Usuario);
  const barbeariaRepository = AppDataSource.getRepository(Barbearia);
  const funcionamentoRepository = AppDataSource.getRepository(BarbeariaFuncionamento);
  const barbeiroRepository = AppDataSource.getRepository(Barbeiro);
  const barbeiroDisponibilidadeRepository = AppDataSource.getRepository(BarbeiroDisponibilidade);
  const servicoRepository = AppDataSource.getRepository(BarbeariaServico);
  const agendamentoRepository = AppDataSource.getRepository(Agendamento);
  const agendamentoItemRepository = AppDataSource.getRepository(AgendamentoItem);

  const cidadePrincipal = await upsertOne(
    cidadeRepository,
    { nome: "Campo Mourao", estado: "PR" },
    { nome: "Campo Mourao", estado: "PR" }
  );

  const cidadeSecundaria = await upsertOne(
    cidadeRepository,
    { nome: "Maringa", estado: "PR" },
    { nome: "Maringa", estado: "PR" }
  );

  const cidadesExtras = [
    { nome: "Curitiba", estado: "PR" },
    { nome: "Londrina", estado: "PR" },
    { nome: "Cascavel", estado: "PR" },
  ];

  for (const cidade of cidadesExtras) {
    await upsertOne(
      cidadeRepository,
      { nome: cidade.nome, estado: cidade.estado },
      { nome: cidade.nome, estado: cidade.estado }
    );
  }

  const cliente = await upsertOne(
    usuarioRepository,
    { email: "cliente@cl.com" },
    {
      nome: "Cliente Demo",
      email: "cliente@cl.com",
      senha: "$2a$10$fuKiZhUt9K3p0UpqaulOc.mU31aBBlmmzFFdUGSeIRpi8jHu6uTky",
      telefone: "(44) 99999-0001",
      tipo_usuario: TipoUsuario.CLIENTE,
      cidade_id: cidadePrincipal.id,
    }
  );

  const dono = await upsertOne(
    usuarioRepository,
    { email: "dono@cl.com" },
    {
      nome: "Dono Barbearia",
      email: "dono@cl.com",
      senha: "$2a$10$fuKiZhUt9K3p0UpqaulOc.mU31aBBlmmzFFdUGSeIRpi8jHu6uTky",
      telefone: "(44) 99999-0002",
      tipo_usuario: TipoUsuario.BARBEARIA,
      cidade_id: cidadeSecundaria.id,
    }
  );

  await upsertOne(
    usuarioRepository,
    { email: "admin@cl.com" },
    {
      nome: "Administrador",
      email: "admin@cl.com",
      senha: "$2a$10$fr9JUp3Koo928x7Sl8v6CeEzBrN/yu.9vY3z9nQfzt3V9GX1PVP1S",
      telefone: "(44) 99999-0000",
      tipo_usuario: TipoUsuario.ADMINISTRADOR,
      cidade_id: cidadePrincipal.id,
    }
  );

  const barbearia = await upsertOne(
    barbeariaRepository,
    { usuario_id: dono.id },
    {
      usuario_id: dono.id,
      nome_comercial: "Barbearia Central",
      telefone_comercial: "(44) 3020-1000",
      endereco: "Av. Central, 1000 - Centro",
      cidade_id: cidadeSecundaria.id,
      descricao: "Cortes classicos e modernos.",
      foto_perfil: "https://images.unsplash.com/photo-1621605815971-fbc98d665033",
      intervalo_base: 60,
    }
  );

  const diasFuncionamento = [
    { dia_semana: 0, esta_aberto: false, hora_abertura: null, hora_fechamento: null },
    { dia_semana: 1, esta_aberto: true, hora_abertura: "08:00:00", hora_fechamento: "18:00:00" },
    { dia_semana: 2, esta_aberto: true, hora_abertura: "08:00:00", hora_fechamento: "18:00:00" },
    { dia_semana: 3, esta_aberto: true, hora_abertura: "08:00:00", hora_fechamento: "18:00:00" },
    { dia_semana: 4, esta_aberto: true, hora_abertura: "08:00:00", hora_fechamento: "18:00:00" },
    { dia_semana: 5, esta_aberto: true, hora_abertura: "08:00:00", hora_fechamento: "19:00:00" },
    { dia_semana: 6, esta_aberto: true, hora_abertura: "08:00:00", hora_fechamento: "16:00:00" },
  ];

  for (const dia of diasFuncionamento) {
    await upsertOne(
      funcionamentoRepository,
      { barbearia_id: barbearia.id, dia_semana: dia.dia_semana },
      {
        barbearia_id: barbearia.id,
        dia_semana: dia.dia_semana,
        esta_aberto: dia.esta_aberto,
        hora_abertura: dia.hora_abertura,
        hora_fechamento: dia.hora_fechamento,
      }
    );
  }

  const barbeiro1 = await upsertOne(
    barbeiroRepository,
    { barbearia_id: barbearia.id, nome: "Rafael" },
    {
      barbearia_id: barbearia.id,
      nome: "Rafael",
      telefone: "(44) 99111-1001",
      ativo: true,
    }
  );

  const barbeirosSeed = [
    { nome: "Lucas", telefone: "(44) 99111-1002", ativo: true },
    { nome: "Pedro", telefone: "(44) 99111-1003", ativo: true },
    { nome: "Mateus", telefone: "(44) 99111-1004", ativo: true },
    { nome: "Joao", telefone: "(44) 99111-1005", ativo: true },
  ];

  for (const barbeiro of barbeirosSeed) {
    await upsertOne(
      barbeiroRepository,
      { barbearia_id: barbearia.id, nome: barbeiro.nome },
      {
        barbearia_id: barbearia.id,
        nome: barbeiro.nome,
        telefone: barbeiro.telefone,
        ativo: barbeiro.ativo,
      }
    );
  }

  const barbeirosBarbearia = await barbeiroRepository.find({
    where: { barbearia_id: barbearia.id },
  });

  for (const barbeiro of barbeirosBarbearia) {
    const disponibilidadesSeed = [
      { dia_semana: 1, esta_disponivel: true, hora_inicio: "08:00:00", hora_fim: "12:00:00" },
      { dia_semana: 1, esta_disponivel: true, hora_inicio: "13:30:00", hora_fim: "18:30:00" },
      { dia_semana: 2, esta_disponivel: true, hora_inicio: "08:00:00", hora_fim: "18:00:00" },
      { dia_semana: 3, esta_disponivel: true, hora_inicio: "08:00:00", hora_fim: "18:00:00" },
      { dia_semana: 4, esta_disponivel: true, hora_inicio: "08:00:00", hora_fim: "18:00:00" },
      { dia_semana: 5, esta_disponivel: true, hora_inicio: "08:00:00", hora_fim: "19:00:00" },
      { dia_semana: 6, esta_disponivel: true, hora_inicio: "08:00:00", hora_fim: "16:00:00" },
    ];

    for (const disponibilidade of disponibilidadesSeed) {
      await upsertOne(
        barbeiroDisponibilidadeRepository,
        {
          barbeiro_id: barbeiro.id,
          dia_semana: disponibilidade.dia_semana,
          hora_inicio: disponibilidade.hora_inicio,
          hora_fim: disponibilidade.hora_fim,
        },
        {
          barbeiro_id: barbeiro.id,
          dia_semana: disponibilidade.dia_semana,
          esta_disponivel: disponibilidade.esta_disponivel,
          hora_inicio: disponibilidade.hora_inicio,
          hora_fim: disponibilidade.hora_fim,
        }
      );
    }
  }

  const servicoCorte = await upsertOne(
    servicoRepository,
    { barbearia_id: barbearia.id, nome_servico: "Corte de Cabelo" },
    {
      barbearia_id: barbearia.id,
      nome_servico: "Corte de Cabelo",
      preco: "45.00",
      duracao_min: 30,
    }
  );

  const servicoBarba = await upsertOne(
    servicoRepository,
    { barbearia_id: barbearia.id, nome_servico: "Barba" },
    {
      barbearia_id: barbearia.id,
      nome_servico: "Barba",
      preco: "30.00",
      duracao_min: 20,
    }
  );

  const servicosExtras = [
    { nome_servico: "Corte + Barba", preco: "70.00", duracao_min: 50 },
    { nome_servico: "Hidratação Capilar", preco: "35.00", duracao_min: 25 },
    { nome_servico: "Limpeza de Ouvido/Nariz", preco: "20.00", duracao_min: 10 },
    { nome_servico: "Tingimento de Barba", preco: "40.00", duracao_min: 30 },
  ];

  for (const servico of servicosExtras) {
    await upsertOne(
      servicoRepository,
      { barbearia_id: barbearia.id, nome_servico: servico.nome_servico },
      {
        barbearia_id: barbearia.id,
        nome_servico: servico.nome_servico,
        preco: servico.preco,
        duracao_min: servico.duracao_min,
      }
    );
  }

  const inicio = new Date("2030-01-15T10:00:00.000Z");

  const fim = new Date(inicio);
  fim.setMinutes(fim.getMinutes() + 60);

  const agendamento = await upsertOne(
    agendamentoRepository,
    {
      cliente_id: cliente.id,
      barbearia_id: barbearia.id,
      barbeiro_id: barbeiro1.id,
      data_hora_inicio: inicio,
    },
    {
      cliente_id: cliente.id,
      barbearia_id: barbearia.id,
      barbeiro_id: barbeiro1.id,
      data_hora_inicio: inicio,
      data_hora_fim: fim,
      valor_total: "75.00",
      status: StatusAgendamento.AGENDADO,
    }
  );

  await upsertOne(
    agendamentoItemRepository,
    { agendamento_id: agendamento.id, servico_id: servicoCorte.id },
    {
      agendamento_id: agendamento.id,
      servico_id: servicoCorte.id,
      preco_cobrado: "45.00",
    }
  );

  await upsertOne(
    agendamentoItemRepository,
    { agendamento_id: agendamento.id, servico_id: servicoBarba.id },
    {
      agendamento_id: agendamento.id,
      servico_id: servicoBarba.id,
      preco_cobrado: "30.00",
    }
  );
}

export { runSeed };

async function runSeedFromCli() {
  try {
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }

    await runSeed(true);
    console.log("✓ Seed executado com sucesso");
  } catch (error) {
    const err = error as Error;
    console.error(`✗ Erro ao executar seed manualmente: ${err.message}`);
    process.exitCode = 1;
  } finally {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  runSeedFromCli();
}
