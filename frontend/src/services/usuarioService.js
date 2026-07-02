import { apiClient } from "./api";

export const usuarioService = {
  //Função para obter todos os usuários
  getAll: async () => {
    const response = await apiClient.get("/api/usuarios");
    return response.data;
  },

  //Função para obter um usuário específico pelo ID
  getById: async (id) => {
    const response = await apiClient.get(`/api/usuarios/${id}`);
    return response.data;
  },

  //Função para atualizar um usuário específico
  update: async (id, data) => {
    const response = await apiClient.put(`/api/usuarios/${id}`, data);
    return response.data;
  },
};

export default usuarioService;