import { pathToFileURL } from "url";
import { DatabaseSingleton } from "./padrao/singleton";
import { Cidade } from "./entities/Cidade";
import { Usuario, TipoUsuario } from "./entities/Usuario";
import { Barbearia } from "./entities/Barbearia";
import { BarbeariaFuncionamento } from "./entities/BarbeariaFuncionamento";
import { Barbeiro } from "./entities/Barbeiro";
import { BarbeiroDisponibilidade } from "./entities/BarbeiroDisponibilidade";
import { BarbeariaServico } from "./entities/BarbeariaServico";
import { Agendamento, StatusAgendamento } from "./entities/Agendamento";
import { AgendamentoItem } from "./entities/AgendamentoItem";

const db = DatabaseSingleton.getInstance();

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

  const cidadeRepository = db.getRepository(Cidade);
  const usuarioRepository = db.getRepository(Usuario);
  const barbeariaRepository = db.getRepository(Barbearia);
  const funcionamentoRepository = db.getRepository(BarbeariaFuncionamento);
  const barbeiroRepository = db.getRepository(Barbeiro);
  const barbeiroDisponibilidadeRepository = db.getRepository(BarbeiroDisponibilidade);
  const servicoRepository = db.getRepository(BarbeariaServico);
  const agendamentoRepository = db.getRepository(Agendamento);
  const agendamentoItemRepository = db.getRepository(AgendamentoItem);

  const diasFuncionamento = [
    { dia_semana: 0, esta_aberto: false, hora_abertura: null, hora_fechamento: null },
    { dia_semana: 1, esta_aberto: true, hora_abertura: "08:00:00", hora_fechamento: "18:00:00" },
    { dia_semana: 2, esta_aberto: true, hora_abertura: "08:00:00", hora_fechamento: "18:00:00" },
    { dia_semana: 3, esta_aberto: true, hora_abertura: "08:00:00", hora_fechamento: "18:00:00" },
    { dia_semana: 4, esta_aberto: true, hora_abertura: "08:00:00", hora_fechamento: "18:00:00" },
    { dia_semana: 5, esta_aberto: true, hora_abertura: "08:00:00", hora_fechamento: "19:00:00" },
    { dia_semana: 6, esta_aberto: true, hora_abertura: "08:00:00", hora_fechamento: "16:00:00" },
  ];

  const disponibilidadesSeed = [
    { dia_semana: 1, esta_disponivel: true, hora_inicio: "08:00:00", hora_fim: "12:00:00" },
    { dia_semana: 1, esta_disponivel: true, hora_inicio: "13:30:00", hora_fim: "18:30:00" },
    { dia_semana: 2, esta_disponivel: true, hora_inicio: "08:00:00", hora_fim: "18:00:00" },
    { dia_semana: 3, esta_disponivel: true, hora_inicio: "08:00:00", hora_fim: "18:00:00" },
    { dia_semana: 4, esta_disponivel: true, hora_inicio: "08:00:00", hora_fim: "18:00:00" },
    { dia_semana: 5, esta_disponivel: true, hora_inicio: "08:00:00", hora_fim: "19:00:00" },
    { dia_semana: 6, esta_disponivel: true, hora_inicio: "08:00:00", hora_fim: "16:00:00" },
  ];

  const catalogoServicosSeed = [
    { nome_servico: "Corte de Cabelo", preco: "45.00", duracao_min: 35 },
    { nome_servico: "Barba", preco: "30.00", duracao_min: 15 },
    { nome_servico: "Sobrancelha", preco: "20.00", duracao_min: 10 },
    { nome_servico: "Corte + Barba", preco: "70.00", duracao_min: 50 },
    { nome_servico: "Corte + Sobrancelha", preco: "55.00", duracao_min: 45 },
    { nome_servico: "Hidratação", preco: "35.00", duracao_min: 25 },
    { nome_servico: "Pigmentação", preco: "25.00", duracao_min: 20 },
  ];

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

  for (const servico of catalogoServicosSeed) {
    await upsertOne(
      servicoRepository,
      { barbearia_id: null, nome_servico: servico.nome_servico },
      {
        barbearia_id: null,
        nome_servico: servico.nome_servico,
        preco: servico.preco,
        duracao_min: servico.duracao_min,
        ativo: true,
      }
    );
  }

  const servicosBarbeariaCentral = catalogoServicosSeed.filter((servico) =>
    ["Corte de Cabelo", "Barba", "Sobrancelha", "Corte + Barba"].includes(servico.nome_servico)
  );

  const barbeariasSeed = [
    {
      owner: {
        nome: "Dono Studio Mourao",
        email: "dono@cl.com",
        telefone: "(44) 99999-1001",
        cidade_id: cidadePrincipal.id,
      },
      shop: {
        nome_comercial: "Studio Mourao",
        telefone_comercial: "(44) 3020-1101",
        endereco: "Rua Brasil, 210 - Centro",
        cidade_id: cidadePrincipal.id,
        descricao: "Foco em cortes clássicos e barba desenhada.",
        foto_perfil: "https://images.unsplash.com/photo-1517832606299-7ae9b720a186",
        intervalo_base: 60,
      },
      barbeiros: [
        { nome: "Rafael", telefone: "(44) 99111-1001", ativo: true },
        { nome: "Lucas", telefone: "(44) 99111-1002", ativo: true },
      ],
      servicos: ["Corte de Cabelo", "Barba", "Corte + Barba"],
    },
    {
      owner: {
        nome: "Dona Campo Nobre",
        email: "campo.nobre@cl.com",
        telefone: "(44) 99999-1002",
        cidade_id: cidadePrincipal.id,
      },
      shop: {
        nome_comercial: "Campo Nobre Barber",
        telefone_comercial: "(44) 3020-1102",
        endereco: "Av. Goioere, 455 - Lar Parana",
        cidade_id: cidadePrincipal.id,
        descricao: "Atendimento rápido com serviços combinados.",
        foto_perfil: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1",
        intervalo_base: 60,
      },
      barbeiros: [
        { nome: "Mateus", telefone: "(44) 99111-1003", ativo: true },
      ],
      servicos: ["Corte de Cabelo", "Sobrancelha", "Corte + Sobrancelha"],
    },
    {
      owner: {
        nome: "Dono Maringa Prime",
        email: "maringa.prime@cl.com",
        telefone: "(44) 99999-1003",
        cidade_id: cidadeSecundaria.id,
      },
      shop: {
        nome_comercial: "Maringa Prime",
        telefone_comercial: "(44) 3020-1201",
        endereco: "Av. XV de Novembro, 980 - Zona 1",
        cidade_id: cidadeSecundaria.id,
        descricao: "Cortes modernos, hidratação e pigmentação.",
        foto_perfil: "https://images.unsplash.com/photo-1585747860715-2ba37e788b70",
        intervalo_base: 60,
      },
      barbeiros: [
        { nome: "Pedro", telefone: "(44) 99111-1004", ativo: true },
        { nome: "Joao", telefone: "(44) 99111-1005", ativo: true },
      ],
      servicos: ["Corte de Cabelo", "Hidratação", "Pigmentação", "Barba"],
    },
    {
      owner: {
        nome: "Dona Zona 7",
        email: "zona7.barber@cl.com",
        telefone: "(44) 99999-1004",
        cidade_id: cidadeSecundaria.id,
      },
      shop: {
        nome_comercial: "Zona 7 Barber Club",
        telefone_comercial: "(44) 3020-1202",
        endereco: "Rua Mandaguari, 320 - Zona 7",
        cidade_id: cidadeSecundaria.id,
        descricao: "Serviços variados para rotina e ocasiões especiais.",
        foto_perfil: "https://images.unsplash.com/photo-1622286342621-4bd786c2447c",
        intervalo_base: 60,
      },
      barbeiros: [
        { nome: "Thiago", telefone: "(44) 99111-1006", ativo: true },
      ],
      servicos: ["Corte de Cabelo", "Barba", "Sobrancelha", "Corte + Barba + Sobrancelha"],
    },
  ];

  let barbeariaAgendamento = null as Barbearia | null;
  let barbeiroAgendamento = null as Barbeiro | null;

  for (const item of barbeariasSeed) {
    const dono = await upsertOne(
      usuarioRepository,
      { email: item.owner.email },
      {
        nome: item.owner.nome,
        email: item.owner.email,
        senha: "$2a$10$fuKiZhUt9K3p0UpqaulOc.mU31aBBlmmzFFdUGSeIRpi8jHu6uTky",
        telefone: item.owner.telefone,
        tipo_usuario: TipoUsuario.BARBEARIA,
        cidade_id: item.owner.cidade_id,
      }
    );

    const barbearia = await upsertOne(
      barbeariaRepository,
      { nome_comercial: item.shop.nome_comercial },
      {
        usuario_id: dono.id,
        nome_comercial: item.shop.nome_comercial,
        telefone_comercial: item.shop.telefone_comercial,
        endereco: item.shop.endereco,
        cidade_id: item.shop.cidade_id,
        descricao: item.shop.descricao,
        foto_perfil: item.shop.foto_perfil,
        intervalo_base: item.shop.intervalo_base,
      }
    );

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

    const barbeirosCriados: Barbeiro[] = [];
    for (const barbeiro of item.barbeiros) {
      const salvo = await upsertOne(
        barbeiroRepository,
        { barbearia_id: barbearia.id, nome: barbeiro.nome },
        {
          barbearia_id: barbearia.id,
          nome: barbeiro.nome,
          telefone: barbeiro.telefone,
          ativo: barbeiro.ativo,
        }
      );
      barbeirosCriados.push(salvo);
    }

    for (const barbeiro of barbeirosCriados) {
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

    for (const nomeServico of item.servicos) {
      const servicoBase = catalogoServicosSeed.find((servico) => servico.nome_servico === nomeServico);
      if (!servicoBase) continue;

      await upsertOne(
        servicoRepository,
        { barbearia_id: barbearia.id, nome_servico: servicoBase.nome_servico },
        {
          barbearia_id: barbearia.id,
          nome_servico: servicoBase.nome_servico,
          preco: servicoBase.preco,
          duracao_min: servicoBase.duracao_min,
          ativo: true,
        }
      );
    }

    if (!barbeariaAgendamento) {
      barbeariaAgendamento = barbearia;
      barbeiroAgendamento = barbeirosCriados[0] || null;
    }
  }

  const servicoCorte = await servicoRepository.findOneByOrFail({
    barbearia_id: barbeariaAgendamento?.id,
    nome_servico: "Corte de Cabelo",
  });

  const servicoBarba = await servicoRepository.findOneByOrFail({
    barbearia_id: barbeariaAgendamento?.id,
    nome_servico: "Barba",
  });

  const inicio = new Date("2030-01-15T10:00:00.000Z");
  const inicioConcluido = new Date("2026-07-01T14:00:00.000Z");

  const fim = new Date(inicio);
  fim.setMinutes(fim.getMinutes() + 60);
  const fimConcluido = new Date(inicioConcluido);
  fimConcluido.setMinutes(fimConcluido.getMinutes() + 60);

  const agendamento = await upsertOne(
    agendamentoRepository,
    {
      cliente_id: cliente.id,
      barbearia_id: barbeariaAgendamento?.id,
      barbeiro_id: barbeiroAgendamento?.id,
      data_hora_inicio: inicio,
    },
    {
      cliente_id: cliente.id,
      barbearia_id: barbeariaAgendamento?.id,
      barbeiro_id: barbeiroAgendamento?.id,
      data_hora_inicio: inicio,
      data_hora_fim: fim,
      valor_total: "75.00",
      status: StatusAgendamento.AGENDADO,
    }
  );

  const agendamentoConcluido = await upsertOne(
    agendamentoRepository,
    {
      cliente_id: cliente.id,
      barbearia_id: barbeariaAgendamento?.id,
      barbeiro_id: barbeiroAgendamento?.id,
      data_hora_inicio: inicioConcluido,
    },
    {
      cliente_id: cliente.id,
      barbearia_id: barbeariaAgendamento?.id,
      barbeiro_id: barbeiroAgendamento?.id,
      data_hora_inicio: inicioConcluido,
      data_hora_fim: fimConcluido,
      valor_total: "30.00",
      status: StatusAgendamento.CONCLUIDO,
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

  await upsertOne(
    agendamentoItemRepository,
    { agendamento_id: agendamentoConcluido.id, servico_id: servicoBarba.id },
    {
      agendamento_id: agendamentoConcluido.id,
      servico_id: servicoBarba.id,
      preco_cobrado: "30.00",
    }
  );
}

export { runSeed };

async function runSeedFromCli() {
  try {
    if (!db.isInitialized) {
      await db.initialize();
    }

    await runSeed(true);
    console.log("S Seed executado com sucesso");
  } catch (error) {
    const err = error as Error;
    console.error(`S Erro ao executar seed manualmente: ${err.message}`);
    process.exitCode = 1;
  } finally {
    if (db.isInitialized) {
      await db.destroy();
    }
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  runSeedFromCli();
}

