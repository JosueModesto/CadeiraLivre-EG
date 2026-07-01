export const swaggerDocs = {
  openapi: "3.0.0",
  info: {
    version: "1.0.0",
    title: "Cadeira Livre - Barbearia API",
    description: "API para gerenciamento de agendamentos de barbearias",
  },
  servers: [
    {
      url: "http://localhost:3001",
      description: "Desenvolvimento",
    },
  ],
  paths: {
    "/api/auth/register": {
      post: {
        summary: "Registra um novo usuário",
        tags: ["Autenticação"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["nome", "email", "senha", "telefone", "tipo_usuario"],
                properties: {
                  nome: { type: "string", description: "Nome do usuário" },
                  email: { type: "string", description: "Email do usuário" },
                  senha: { type: "string", description: "Senha (mínimo 6 caracteres)" },
                  telefone: { type: "string", description: "Telefone do usuário" },
                  tipo_usuario: { type: "string", enum: ["cliente", "barbearia", "administrador"], description: "Tipo de usuário" },
                  cidade_id: { type: "number", description: "ID da cidade (opcional)" },
                },
              },
            },
          },
        },
        responses: {
          "201": {
            description: "Usuário registrado com sucesso",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    id: { type: "number" },
                    nome: { type: "string" },
                    email: { type: "string" },
                    telefone: { type: "string" },
                    tipo_usuario: { type: "string" },
                    criado_em: { type: "string" },
                  },
                },
              },
            },
          },
          "400": { description: "Email já cadastrado ou campos obrigatórios faltando" },
          "500": { description: "Erro interno do servidor" },
        },
      },
    },
    "/api/auth/login": {
      post: {
        summary: "Autentica um usuário e retorna um token JWT",
        tags: ["Autenticação"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["email", "senha"],
                properties: {
                  email: { type: "string", description: "Email do usuário" },
                  senha: { type: "string", description: "Senha do usuário" },
                },
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Autenticação bem-sucedida",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    token: { type: "string" },
                    user: {
                      type: "object",
                      properties: {
                        id: { type: "number" },
                        nome: { type: "string" },
                        email: { type: "string" },
                        tipo_usuario: { type: "string" },
                      },
                    },
                  },
                },
              },
            },
          },
          "401": { description: "Credenciais inválidas" },
          "500": { description: "Erro interno do servidor" },
        },
      },
    },
    "/api/usuarios": {
      post: {
        summary: "Cria um novo usuário no sistema",
        tags: ["Usuários"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["nome", "email", "senha", "telefone", "tipo_usuario"],
                properties: {
                  nome: { type: "string", description: "Nome completo do usuário" },
                  email: { type: "string", description: "Email único do usuário" },
                  senha: { type: "string", description: "Senha (mínimo 6 caracteres)" },
                  telefone: { type: "string", description: "Telefone do usuário" },
                  tipo_usuario: { type: "string", enum: ["cliente", "barbearia", "administrador"], description: "Tipo de usuário" },
                  cidade_id: { type: "number", description: "ID da cidade (opcional)" },
                },
              },
            },
          },
        },
        responses: {
          "201": {
            description: "Usuário criado com sucesso",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    message: { type: "string" },
                    usuario: {
                      type: "object",
                      properties: {
                        id: { type: "number" },
                        nome: { type: "string" },
                        email: { type: "string" },
                        telefone: { type: "string" },
                        tipo_usuario: { type: "string" },
                        cidade_id: { type: "number" },
                        criado_em: { type: "string" },
                      },
                    },
                  },
                },
              },
            },
          },
          "400": { description: "Email já cadastrado ou campos obrigatórios faltando" },
          "500": { description: "Erro interno do servidor" },
        },
      },
      get: {
        summary: "Lista todos os usuários",
        tags: ["Usuários"],
        responses: {
          "200": {
            description: "Lista de usuários",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    usuarios: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          id: { type: "number" },
                          nome: { type: "string" },
                          email: { type: "string" },
                          telefone: { type: "string" },
                          tipo_usuario: { type: "string" },
                          cidade_id: { type: "number" },
                          criado_em: { type: "string" },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          "500": { description: "Erro interno do servidor" },
        },
      },
    },
    "/api/usuarios/{id}": {
      get: {
        summary: "Obtém um usuário específico",
        tags: ["Usuários"],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "number" },
            description: "ID do usuário",
          },
        ],
        responses: {
          "200": {
            description: "Usuário encontrado",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    id: { type: "number" },
                    nome: { type: "string" },
                    email: { type: "string" },
                    telefone: { type: "string" },
                    tipo_usuario: { type: "string" },
                    cidade_id: { type: "number" },
                    criado_em: { type: "string" },
                  },
                },
              },
            },
          },
          "404": { description: "Usuário não encontrado" },
          "500": { description: "Erro interno do servidor" },
        },
      },
      put: {
        summary: "Atualiza um usuário existente",
        tags: ["Usuários"],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "number" },
            description: "ID do usuário",
          },
        ],
        requestBody: {
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  nome: { type: "string", description: "Nome do usuário" },
                  telefone: { type: "string", description: "Telefone do usuário" },
                  tipo_usuario: { type: "string", description: "Tipo de usuário" },
                  cidade_id: { type: "number", description: "ID da cidade" },
                  senha: { type: "string", description: "Nova senha (mínimo 6 caracteres)" },
                },
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Usuário atualizado com sucesso",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    message: { type: "string" },
                    usuario: {
                      type: "object",
                      properties: {
                        id: { type: "number" },
                        nome: { type: "string" },
                        email: { type: "string" },
                        telefone: { type: "string" },
                        tipo_usuario: { type: "string" },
                        cidade_id: { type: "number" },
                        criado_em: { type: "string" },
                      },
                    },
                  },
                },
              },
            },
          },
          "404": { description: "Usuário não encontrado" },
          "400": { description: "Campos inválidos" },
          "500": { description: "Erro interno do servidor" },
        },
      },
    },
    // ================= ROTAS DE CIDADES =================
    "/api/cidades": {
      post: {
        summary: "Cria uma nova cidade",
        tags: ["Cidades"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["nome", "estado"],
                properties: {
                  nome: { type: "string", description: "Nome da cidade" },
                  estado: { type: "string", description: "Sigla do estado (Ex: SP)" },
                },
              },
            },
          },
        },
        responses: {
          "201": {
            description: "Cidade criada com sucesso",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    message: { type: "string", example: "Cidade criada com sucesso!" },
                  },
                },
              },
            },
          },
          "400": {
            description: "Campos obrigatórios faltando",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    message: { type: "string", example: "Campos obrigatórios faltando" },
                  },
                },
              },
            },
          },
          "500": {
            description: "Erro interno no servidor",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    message: { type: "string", example: "Erro interno no Servidor" },
                    error: { type: "string" },
                  },
                },
              },
            },
          },
        },
      },
      get: {
        summary: "Lista todas as cidades",
        tags: ["Cidades"],
        responses: {
          "200": {
            description: "Lista de cidades cadastrada",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    cidades: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          id: { type: "number" },
                          nome: { type: "string" },
                          estado: { type: "string" },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          "500": {
            description: "Erro interno no servidor",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    message: { type: "string", example: "Erro interno no servidor" },
                    error: { type: "string" },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/api/cidades/{id}": {
      get: {
        summary: "Obtém uma cidade específica com seus usuários e barbearias filtrados",
        tags: ["Cidades"],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "number" },
            description: "ID da cidade",
          },
        ],
        responses: {
          "200": {
            description: "Cidade encontrada",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    id: { type: "number" },
                    nome: { type: "string" },
                    estado: { type: "string" },
                    usuarios: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          id: { type: "number" },
                          nome: { type: "string" },
                        },
                      },
                    },
                    barbearias: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          id: { type: "number" },
                          nome: { type: "string" },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          "404": {
            description: "Cidade não encontrada",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    message: { type: "string", example: "Cidade não encontrada" },
                  },
                },
              },
            },
          },
          "500": {
            description: "Erro interno no servidor",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    message: { type: "string", example: "Erro interno no servidor" },
                    error: { type: "string" },
                  },
                },
              },
            },
          },
        },
      },
      put: {
        summary: "Atualiza uma cidade",
        tags: ["Cidades"],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "number" },
            description: "ID da cidade",
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  nome: { type: "string", description: "Nome da cidade" },
                  estado: { type: "string", description: "Sigla do estado (Ex: SP)" },
                },
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Cidade atualizada com sucesso",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    message: { type: "string", example: "Cidade atualizada com sucesso!" },
                    cidade: {
                      type: "object",
                      properties: {
                        id: { type: "number" },
                        nome: { type: "string" },
                        estado: { type: "string" },
                      },
                    },
                  },
                },
              },
            },
          },
          "404": {
            description: "Cidade não encontrada",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    message: { type: "string", example: "Cidade não encontrada" },
                  },
                },
              },
            },
          },
          "500": {
            description: "Erro interno no servidor",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    message: { type: "string", example: "Erro interno no servidor" },
                    error: { type: "string" },
                  },
                },
              },
            },
          },
        },
      },
      delete: {
        summary: "Exclui uma cidade",
        tags: ["Cidades"],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "number" },
            description: "ID da cidade",
          },
        ],
        responses: {
          "200": {
            description: "Cidade excluída com sucesso",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    message: { type: "string", example: "Cidade excluída com sucesso!" },
                  },
                },
              },
            },
          },
          "404": {
            description: "Cidade não encontrada",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    message: { type: "string", example: "Cidade não encontrada" },
                  },
                },
              },
            },
          },
          "500": {
            description: "Erro interno no servidor",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    message: { type: "string", example: "Erro interno no servidor" },
                    error: { type: "string" },
                  },
                },
              },
            },
          },
        },
      },
    },
    // ================= ROTAS DE BARBEIROS =================
    "/api/barbeiros": {
      post: {
        summary: "Cria um novo barbeiro",
        tags: ["Barbeiros"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["barbearia_id", "nome", "telefone"],
                properties: {
                  barbearia_id: { type: "number", description: "ID da barbearia" },
                  nome: { type: "string", description: "Nome do barbeiro" },
                  telefone: { type: "string", description: "Telefone do barbeiro" },
                  ativo: { type: "boolean", description: "Status do barbeiro" },
                },
              },
            },
          },
        },
        responses: {
          "201": {
            description: "Barbeiro criado com sucesso",
          },
          "400": { description: "Campos obrigatórios faltando" },
          "500": { description: "Erro interno no servidor" },
        },
      },
      get: {
        summary: "Lista todos os barbeiros",
        tags: ["Barbeiros"],
        responses: {
          "200": {
            description: "Lista de barbeiros",
          },
          "500": { description: "Erro interno no servidor" },
        },
      },
    },
    "/api/barbeiros/{id}": {
      get: {
        summary: "Obtém um barbeiro específico",
        tags: ["Barbeiros"],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "number" },
            description: "ID do barbeiro",
          },
        ],
        responses: {
          "200": { description: "Barbeiro encontrado" },
          "404": { description: "Barbeiro não encontrado" },
          "500": { description: "Erro interno no servidor" },
        },
      },
      put: {
        summary: "Atualiza um barbeiro",
        tags: ["Barbeiros"],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "number" },
            description: "ID do barbeiro",
          },
        ],
        requestBody: {
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  barbearia_id: { type: "number" },
                  nome: { type: "string" },
                  telefone: { type: "string" },
                  ativo: { type: "boolean" },
                },
              },
            },
          },
        },
        responses: {
          "200": { description: "Barbeiro atualizado com sucesso" },
          "404": { description: "Barbeiro não encontrado" },
          "500": { description: "Erro interno no servidor" },
        },
      },
      delete: {
        summary: "Exclui um barbeiro",
        tags: ["Barbeiros"],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "number" },
            description: "ID do barbeiro",
          },
        ],
        responses: {
          "200": { description: "Barbeiro excluído com sucesso" },
          "404": { description: "Barbeiro não encontrado" },
          "500": { description: "Erro interno no servidor" },
        },
      },
    },
    "/api/barbeiros/{id}/disponibilidade": {
      get: {
        summary: "Lista os intervalos de disponibilidade configurados para o barbeiro",
        tags: ["Barbeiros"],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "number" },
            description: "ID do barbeiro",
          },
        ],
        responses: {
          "200": { description: "Disponibilidades do barbeiro" },
          "404": { description: "Barbeiro não encontrado" },
        },
      },
      put: {
        summary: "Define os intervalos de disponibilidade por dia da semana para o barbeiro",
        tags: ["Barbeiros"],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "number" },
            description: "ID do barbeiro",
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  disponibilidades: {
                    type: "array",
                    items: {
                      type: "object",
                      required: ["dia_semana", "esta_disponivel"],
                      properties: {
                        dia_semana: { type: "number", minimum: 0, maximum: 6 },
                        esta_disponivel: { type: "boolean" },
                        hora_inicio: { type: "string", example: "08:00" },
                        hora_fim: { type: "string", example: "12:00" },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        responses: {
          "200": { description: "Disponibilidade atualizada" },
          "400": { description: "Payload inválido" },
          "401": { description: "Não autenticado" },
          "403": { description: "Sem permissão" },
          "404": { description: "Barbeiro não encontrado" },
        },
      },
    },
    "/api/servicos": {
      post: {
        summary: "Cria um novo serviço",
        tags: ["Serviços"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["barbearia_id", "nome_servico", "preco", "duracao_min"],
                properties: {
                  barbearia_id: { type: "number", description: "ID da barbearia" },
                  nome_servico: { type: "string", description: "Nome do serviço" },
                  preco: { type: "string", description: "Preço do serviço (decimal)" },
                  duracao_min: { type: "number", description: "Duração em minutos" },
                },
              },
            },
          },
        },
        responses: {
          "201": { description: "Serviço criado com sucesso" },
          "400": { description: "Campos obrigatórios faltando" },
          "500": { description: "Erro interno no servidor" },
        },
      },
      get: {
        summary: "Lista todos os serviços",
        tags: ["Serviços"],
        responses: {
          "200": { description: "Lista de serviços" },
          "500": { description: "Erro interno no servidor" },
        },
      },
    },
    "/api/servicos/{id}": {
      get: {
        summary: "Obtém um serviço específico",
        tags: ["Serviços"],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "number" },
            description: "ID do serviço",
          },
        ],
        responses: {
          "200": { description: "Serviço encontrado" },
          "404": { description: "Serviço não encontrado" },
          "500": { description: "Erro interno no servidor" },
        },
      },
      put: {
        summary: "Atualiza um serviço",
        tags: ["Serviços"],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "number" },
            description: "ID do serviço",
          },
        ],
        requestBody: {
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  barbearia_id: { type: "number" },
                  nome_servico: { type: "string" },
                  preco: { type: "string" },
                  duracao_min: { type: "number" },
                },
              },
            },
          },
        },
        responses: {
          "200": { description: "Serviço atualizado com sucesso" },
          "404": { description: "Serviço não encontrado" },
          "500": { description: "Erro interno no servidor" },
        },
      },
      delete: {
        summary: "Exclui um serviço",
        tags: ["Serviços"],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "number" },
            description: "ID do serviço",
          },
        ],
        responses: {
          "200": { description: "Serviço excluído com sucesso" },
          "404": { description: "Serviço não encontrado" },
          "500": { description: "Erro interno no servidor" },
        },
      },
    },
    "/api/agendamentos": {
      post: {
        summary: "Cria um novo agendamento para o cliente autenticado",
        tags: ["Agendamentos"],
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["barbearia_id", "barbeiro_id", "servico_ids", "data_hora_inicio"],
                properties: {
                  barbearia_id: { type: "number" },
                  barbeiro_id: { type: "number" },
                  servico_ids: { type: "array", items: { type: "number" } },
                  data_hora_inicio: { type: "string", format: "date-time" },
                },
              },
            },
          },
        },
        responses: {
          "201": { description: "Agendamento realizado com sucesso" },
          "400": { description: "Dados inválidos ou horário fora do funcionamento" },
          "401": { description: "Não autenticado" },
          "404": { description: "Barbearia ou barbeiro não encontrado" },
          "409": { description: "Horário já ocupado para esse barbeiro" },
        },
      },
    },
    "/api/agendamentos/my-appointments": {
      get: {
        summary: "Lista os agendamentos do cliente autenticado",
        tags: ["Agendamentos"],
        security: [{ bearerAuth: [] }],
        responses: {
          "200": { description: "Agendamentos do cliente" },
          "401": { description: "Não autenticado" },
        },
      },
    },
    "/api/agendamentos/available-slots": {
      get: {
        summary: "Lista horários disponíveis em blocos fixos de 60 minutos",
        tags: ["Agendamentos"],
        parameters: [
          { name: "barbearia_id", in: "query", required: true, schema: { type: "number" } },
          { name: "barbeiro_id", in: "query", required: true, schema: { type: "number" } },
          {
            name: "data",
            in: "query",
            required: true,
            schema: { type: "string", example: "2026-07-01" },
          },
        ],
        responses: {
          "200": { description: "Lista de horários disponíveis" },
          "400": { description: "Parâmetros inválidos" },
          "404": { description: "Barbearia não encontrada" },
        },
      },
    },
    "/api/agendamentos/check-availability": {
      get: {
        summary: "Verifica se um horário específico está disponível para o barbeiro",
        tags: ["Agendamentos"],
        parameters: [
          { name: "barbearia_id", in: "query", required: true, schema: { type: "number" } },
          { name: "barbeiro_id", in: "query", required: true, schema: { type: "number" } },
          {
            name: "data_hora_inicio",
            in: "query",
            required: true,
            schema: { type: "string", format: "date-time" },
          },
        ],
        responses: {
          "200": { description: "Disponibilidade retornada" },
          "400": { description: "Parâmetros inválidos" },
        },
      },
    },
    "/api/barbearias/{id}/agendamento-config": {
      get: {
        summary: "Obtém configuração de agendamento da barbearia (funcionamento e intervalo)",
        tags: ["Barbearias"],
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "number" } },
        ],
        responses: {
          "200": { description: "Configuração carregada" },
          "401": { description: "Não autenticado" },
          "404": { description: "Barbearia não encontrada para o usuário" },
        },
      },
    },
    "/api/barbearias/{id}/agendamentos": {
      get: {
        summary: "Lista os agendamentos de um barbeiro da barbearia em um dia específico",
        tags: ["Barbearias"],
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "number" } },
          { name: "barbeiro_id", in: "query", required: true, schema: { type: "number" } },
          { name: "data", in: "query", required: true, schema: { type: "string", example: "2026-07-01" } },
        ],
        responses: {
          "200": { description: "Agendamentos do barbeiro no dia" },
          "400": { description: "Parâmetros inválidos" },
          "401": { description: "Não autenticado" },
          "404": { description: "Barbearia não encontrada para o usuário" },
        },
      },
    },
    "/api/barbearias/{id}/agendamentos/proximos": {
      get: {
        summary: "Lista os próximos agendamentos da barbearia considerando todos os barbeiros",
        tags: ["Barbearias"],
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "number" } },
        ],
        responses: {
          "200": { description: "Próximos agendamentos" },
          "401": { description: "Não autenticado" },
          "404": { description: "Barbearia não encontrada para o usuário" },
        },
      },
    },
    "/api/barbearias/{id}/funcionamento": {
      put: {
        summary: "Define horários de funcionamento por dia da semana",
        tags: ["Barbearias"],
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "number" } },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  funcionamento: {
                    type: "array",
                    items: {
                      type: "object",
                      required: ["dia_semana", "esta_aberto"],
                      properties: {
                        dia_semana: { type: "number", minimum: 0, maximum: 6 },
                        esta_aberto: { type: "boolean" },
                        hora_abertura: { type: "string", example: "09:00" },
                        hora_fechamento: { type: "string", example: "18:00" },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        responses: {
          "200": { description: "Funcionamento atualizado" },
          "400": { description: "Payload inválido" },
          "401": { description: "Não autenticado" },
          "404": { description: "Barbearia não encontrada para o usuário" },
        },
      },
    },
    "/api/barbearias/{id}/intervalo": {
      put: {
        summary: "Define o intervalo-base de agendamento (fixo em 60 minutos)",
        tags: ["Barbearias"],
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "number" } },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["intervalo_base"],
                properties: {
                  intervalo_base: { type: "number", example: 60 },
                },
              },
            },
          },
        },
        responses: {
          "200": { description: "Intervalo atualizado" },
          "400": { description: "Intervalo inválido" },
          "401": { description: "Não autenticado" },
          "404": { description: "Barbearia não encontrada para o usuário" },
        },
      },
    },
  },
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
    },
  },
};
