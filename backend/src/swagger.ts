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
        summary: "Registra um novo usurio",
        tags: ["Autenticao"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["nome", "email", "senha", "telefone", "tipo_usuario"],
                properties: {
                  nome: { type: "string", description: "Nome do usurio" },
                  email: { type: "string", description: "Email do usurio" },
                  senha: { type: "string", description: "Senha (mnimo 6 caracteres)" },
                  telefone: { type: "string", description: "Telefone do usurio" },
                  tipo_usuario: { type: "string", enum: ["cliente", "barbearia", "administrador"], description: "Tipo de usurio" },
                  cidade_id: { type: "number", description: "ID da cidade (opcional)" },
                },
              },
            },
          },
        },
        responses: {
          "201": {
            description: "Usurio registrado com sucesso",
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
          "400": { description: "Email j cadastrado ou campos obrigatrios faltando" },
          "500": { description: "Erro interno do servidor" },
        },
      },
    },
    "/api/auth/login": {
      post: {
        summary: "Autentica um usurio e retorna um token JWT",
        tags: ["Autenticao"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["email", "senha"],
                properties: {
                  email: { type: "string", description: "Email do usurio" },
                  senha: { type: "string", description: "Senha do usurio" },
                },
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Autenticao bem-sucedida",
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
          "401": { description: "Credenciais invlidas" },
          "500": { description: "Erro interno do servidor" },
        },
      },
    },
    "/api/usuarios": {
      post: {
        summary: "Cria um novo usurio no sistema",
        tags: ["Usurios"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["nome", "email", "senha", "telefone", "tipo_usuario"],
                properties: {
                  nome: { type: "string", description: "Nome completo do usurio" },
                  email: { type: "string", description: "Email nico do usurio" },
                  senha: { type: "string", description: "Senha (mnimo 6 caracteres)" },
                  telefone: { type: "string", description: "Telefone do usurio" },
                  tipo_usuario: { type: "string", enum: ["cliente", "barbearia", "administrador"], description: "Tipo de usurio" },
                  cidade_id: { type: "number", description: "ID da cidade (opcional)" },
                },
              },
            },
          },
        },
        responses: {
          "201": {
            description: "Usurio criado com sucesso",
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
          "400": { description: "Email j cadastrado ou campos obrigatrios faltando" },
          "500": { description: "Erro interno do servidor" },
        },
      },
      get: {
        summary: "Lista todos os usurios",
        tags: ["Usurios"],
        responses: {
          "200": {
            description: "Lista de usurios",
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
        summary: "Obtm um usurio especfico",
        tags: ["Usurios"],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "number" },
            description: "ID do usurio",
          },
        ],
        responses: {
          "200": {
            description: "Usurio encontrado",
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
          "404": { description: "Usurio no encontrado" },
          "500": { description: "Erro interno do servidor" },
        },
      },
      put: {
        summary: "Atualiza um usurio existente",
        tags: ["Usurios"],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "number" },
            description: "ID do usurio",
          },
        ],
        requestBody: {
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  nome: { type: "string", description: "Nome do usurio" },
                  telefone: { type: "string", description: "Telefone do usurio" },
                  tipo_usuario: { type: "string", description: "Tipo de usurio" },
                  cidade_id: { type: "number", description: "ID da cidade" },
                  senha: { type: "string", description: "Nova senha (mnimo 6 caracteres)" },
                },
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Usurio atualizado com sucesso",
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
          "404": { description: "Usurio no encontrado" },
          "400": { description: "Campos invlidos" },
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
            description: "Campos obrigatrios faltando",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    message: { type: "string", example: "Campos obrigatrios faltando" },
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
        summary: "Obtm uma cidade especfica com seus usurios e barbearias filtrados",
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
            description: "Cidade no encontrada",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    message: { type: "string", example: "Cidade no encontrada" },
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
            description: "Cidade no encontrada",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    message: { type: "string", example: "Cidade no encontrada" },
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
            description: "Cidade excluda com sucesso",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    message: { type: "string", example: "Cidade excluda com sucesso!" },
                  },
                },
              },
            },
          },
          "404": {
            description: "Cidade no encontrada",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    message: { type: "string", example: "Cidade no encontrada" },
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
          "400": { description: "Campos obrigatrios faltando" },
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
        summary: "Obtm um barbeiro especfico",
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
          "404": { description: "Barbeiro no encontrado" },
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
          "404": { description: "Barbeiro no encontrado" },
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
          "200": { description: "Barbeiro excludo com sucesso" },
          "404": { description: "Barbeiro no encontrado" },
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
          "404": { description: "Barbeiro no encontrado" },
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
          "400": { description: "Payload invlido" },
          "401": { description: "No autenticado" },
          "403": { description: "Sem permisso" },
          "404": { description: "Barbeiro no encontrado" },
        },
      },
    },
    "/api/servicos": {
      post: {
        summary: "Cria um novo servio",
        tags: ["Servios"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["barbearia_id", "nome_servico", "preco", "duracao_min"],
                properties: {
                  barbearia_id: { type: "number", description: "ID da barbearia" },
                  nome_servico: { type: "string", description: "Nome do servio" },
                  preco: { type: "string", description: "Preo do servio (decimal)" },
                  duracao_min: { type: "number", description: "Durao em minutos" },
                },
              },
            },
          },
        },
        responses: {
          "201": { description: "Servio criado com sucesso" },
          "400": { description: "Campos obrigatrios faltando" },
          "500": { description: "Erro interno no servidor" },
        },
      },
      get: {
        summary: "Lista todos os servios",
        tags: ["Servios"],
        responses: {
          "200": { description: "Lista de servios" },
          "500": { description: "Erro interno no servidor" },
        },
      },
    },
    "/api/servicos/{id}": {
      get: {
        summary: "Obtm um servio especfico",
        tags: ["Servios"],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "number" },
            description: "ID do servio",
          },
        ],
        responses: {
          "200": { description: "Servio encontrado" },
          "404": { description: "Servio no encontrado" },
          "500": { description: "Erro interno no servidor" },
        },
      },
      put: {
        summary: "Atualiza um servio",
        tags: ["Servios"],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "number" },
            description: "ID do servio",
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
          "200": { description: "Servio atualizado com sucesso" },
          "404": { description: "Servio no encontrado" },
          "500": { description: "Erro interno no servidor" },
        },
      },
      delete: {
        summary: "Exclui um servio",
        tags: ["Servios"],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "number" },
            description: "ID do servio",
          },
        ],
        responses: {
          "200": { description: "Servio excludo com sucesso" },
          "404": { description: "Servio no encontrado" },
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
          "400": { description: "Dados invlidos ou horrio fora do funcionamento" },
          "401": { description: "No autenticado" },
          "404": { description: "Barbearia ou barbeiro no encontrado" },
          "409": { description: "Horrio j ocupado para esse barbeiro" },
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
          "401": { description: "No autenticado" },
        },
      },
    },
    "/api/agendamentos/available-slots": {
      get: {
        summary: "Lista horrios disponveis em blocos fixos de 60 minutos",
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
          "200": { description: "Lista de horrios disponveis" },
          "400": { description: "Parmetros invlidos" },
          "404": { description: "Barbearia no encontrada" },
        },
      },
    },
    "/api/agendamentos/check-availability": {
      get: {
        summary: "Verifica se um horrio especfico est disponvel para o barbeiro",
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
          "400": { description: "Parmetros invlidos" },
        },
      },
    },
    "/api/barbearias/{id}/agendamento-config": {
      get: {
        summary: "Obtm configurao de agendamento da barbearia (funcionamento e intervalo)",
        tags: ["Barbearias"],
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "number" } },
        ],
        responses: {
          "200": { description: "Configurao carregada" },
          "401": { description: "No autenticado" },
          "404": { description: "Barbearia no encontrada para o usurio" },
        },
      },
    },
    "/api/barbearias/{id}/agendamentos": {
      get: {
        summary: "Lista os agendamentos de um barbeiro da barbearia em um dia especfico",
        tags: ["Barbearias"],
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "number" } },
          { name: "barbeiro_id", in: "query", required: true, schema: { type: "number" } },
          { name: "data", in: "query", required: true, schema: { type: "string", example: "2026-07-01" } },
        ],
        responses: {
          "200": { description: "Agendamentos do barbeiro no dia" },
          "400": { description: "Parmetros invlidos" },
          "401": { description: "No autenticado" },
          "404": { description: "Barbearia no encontrada para o usurio" },
        },
      },
    },
    "/api/barbearias/{id}/agendamentos/proximos": {
      get: {
        summary: "Lista os prximos agendamentos da barbearia considerando todos os barbeiros",
        tags: ["Barbearias"],
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "number" } },
        ],
        responses: {
          "200": { description: "Prximos agendamentos" },
          "401": { description: "No autenticado" },
          "404": { description: "Barbearia no encontrada para o usurio" },
        },
      },
    },
    "/api/barbearias/{id}/funcionamento": {
      put: {
        summary: "Define horrios de funcionamento por dia da semana",
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
          "400": { description: "Payload invlido" },
          "401": { description: "No autenticado" },
          "404": { description: "Barbearia no encontrada para o usurio" },
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
          "400": { description: "Intervalo invlido" },
          "401": { description: "No autenticado" },
          "404": { description: "Barbearia no encontrada para o usurio" },
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
