import { AppDataSource } from "./data-source";
import { Cidade } from "./entities/Cidade";
import { Usuario, TipoUsuario } from "./entities/Usuario";
import { Barbearia } from "./entities/Barbearia";
import { BarbeariaFuncionamento } from "./entities/BarbeariaFuncionamento";
import { Barbeiro } from "./entities/Barbeiro";
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

async function runSeed() {
  const shouldRunSeed = process.env.DB_RUN_SEED === "true";

  if (!shouldRunSeed) {
    return;
  }

  const cidadeRepository = AppDataSource.getRepository(Cidade);
  const usuarioRepository = AppDataSource.getRepository(Usuario);
  const barbeariaRepository = AppDataSource.getRepository(Barbearia);
  const funcionamentoRepository = AppDataSource.getRepository(BarbeariaFuncionamento);
  const barbeiroRepository = AppDataSource.getRepository(Barbeiro);
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

  const cliente = await upsertOne(
    usuarioRepository,
    { email: "cliente@cadeiralivre.com" },
    {
      nome: "Cliente Demo",
      email: "cliente@cadeiralivre.com",
      senha: "$2b$10$abcdefghijklmnopqrstuv1234567890abcdefghijklmnopq",
      telefone: "(44) 99999-0001",
      tipo_usuario: TipoUsuario.CLIENTE,
      cidade_id: cidadePrincipal.id,
    }
  );

  const dono = await upsertOne(
    usuarioRepository,
    { email: "dono@cadeiralivre.com" },
    {
      nome: "Dono Barbearia",
      email: "dono@cadeiralivre.com",
      senha: "$2b$10$abcdefghijklmnopqrstuv1234567890abcdefghijklmnopq",
      telefone: "(44) 99999-0002",
      tipo_usuario: TipoUsuario.BARBEARIA,
      cidade_id: cidadeSecundaria.id,
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
      intervalo_base: 15,
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
      ativo: true,
    }
  );

  await upsertOne(
    barbeiroRepository,
    { barbearia_id: barbearia.id, nome: "Lucas" },
    {
      barbearia_id: barbearia.id,
      nome: "Lucas",
      ativo: true,
    }
  );

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

  const inicio = new Date("2030-01-15T10:00:00.000Z");

  const fim = new Date(inicio);
  fim.setMinutes(fim.getMinutes() + 50);

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

  console.log("✓ Seed executado com sucesso");
}

export { runSeed };
