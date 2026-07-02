import { apiClient } from "./api";

export const cidadeService = {
  //Função para criar uma cidade
  create: async (data) => {
    const response = await apiClient.post("/api/cidades", data);
    return response.data;
  },

  //Função para obter todas as cidades
  getAll: async () => {
    const response = await apiClient.get("/api/cidades");
    return response.data;
  },

  //Função para obter uma cidade específica pelo ID
  getById: async (id) => {
    const response = await apiClient.get(`/api/cidades/${id}`);
    return response.data;
  },

  //Função para atualizar uma cidade específica
  update: async (id, data) => {
    const response = await apiClient.put(`/api/cidades/${id}`, data);
    return response.data;
  },

  //Função para remover uma cidade específica
  remove: async (id) => {
    const response = await apiClient.delete(`/api/cidades/${id}`);
    return response.data;
  },
};

export default cidadeService;
