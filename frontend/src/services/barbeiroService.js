import { apiClient } from "./api";

export const barbeiroService = {
  //Função para criar um barbeiro
  create: async (data) => {
    const response = await apiClient.post("/api/barbeiros", data);
    return response.data;
  },

  //Função para obter todos os barbeiros
  getAll: async (params = {}) => {
    const response = await apiClient.get("/api/barbeiros", { params });
    return response.data;
  },

  //Função para obter um barbeiro específico pelo ID
  getById: async (id) => {
    const response = await apiClient.get(`/api/barbeiros/${id}`);
    return response.data;
  },

  //Função para obter a disponibilidade de um barbeiro específico
  getDisponibilidade: async (id) => {
    const response = await apiClient.get(`/api/barbeiros/${id}/disponibilidade`);
    return response.data;
  },

  //Função para definir a disponibilidade de um barbeiro específico
  setDisponibilidade: async (id, data) => {
    const response = await apiClient.put(`/api/barbeiros/${id}/disponibilidade`, data);
    return response.data;
  },

  //Função para atualizar um barbeiro específico
  update: async (id, data) => {
    const response = await apiClient.put(`/api/barbeiros/${id}`, data);
    return response.data;
  },

  //Função para remover um barbeiro específico
  remove: async (id) => {
    const response = await apiClient.delete(`/api/barbeiros/${id}`);
    return response.data;
  },
};

export default barbeiroService;