export const swaggerDocs = {
  openapi: "3.0.0",
  info: {
    version: "1.0.0",
    title: "Cadeira Livre - Barbearia API",
    description: "API para gerenciamento de agendamentos de barbearias",
  },
  servers: [
    {
      url: "http://localhost:3000",
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
                  tipo_usuario: { type: "string", enum: ["cliente", "barbearia"], description: "Tipo de usuário" },
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
                  tipo_usuario: { type: "string", enum: ["cliente", "barbearia"], description: "Tipo de usuário" },
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
    },
};
