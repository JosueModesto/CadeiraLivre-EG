import { apiClient } from "./api";

export const servicoService = {
  //Função para criar um serviço
  create: async (data) => {
    const response = await apiClient.post("/api/servicos", data);
    return response.data;
  },

  //Função para obter todos os serviços
  getAll: async (params = {}) => {
    const response = await apiClient.get("/api/servicos", { params });
    return response.data;
  },

  //Função para obter um serviço específico pelo ID
  getById: async (id) => {
    const response = await apiClient.get(`/api/servicos/${id}`);
    return response.data;
  },

  //Função para atualizar um serviço específico
  update: async (id, data) => {
    const response = await apiClient.put(`/api/servicos/${id}`, data);
    return response.data;
  },

  //Função para remover um serviço específico
  remove: async (id) => {
    const response = await apiClient.delete(`/api/servicos/${id}`);
    return response.data;
  },
};

export default servicoService;
