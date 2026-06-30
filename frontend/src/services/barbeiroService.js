import { apiClient } from "./api";

export const barbeiroService = {
  create: async (data) => {
    const response = await apiClient.post("/api/barbeiros", data);
    return response.data;
  },

  getAll: async (params = {}) => {
    const response = await apiClient.get("/api/barbeiros", { params });
    return response.data;
  },

  getById: async (id) => {
    const response = await apiClient.get(`/api/barbeiros/${id}`);
    return response.data;
  },

  getDisponibilidade: async (id) => {
    const response = await apiClient.get(`/api/barbeiros/${id}/disponibilidade`);
    return response.data;
  },

  setDisponibilidade: async (id, data) => {
    const response = await apiClient.put(`/api/barbeiros/${id}/disponibilidade`, data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await apiClient.put(`/api/barbeiros/${id}`, data);
    return response.data;
  },

  remove: async (id) => {
    const response = await apiClient.delete(`/api/barbeiros/${id}`);
    return response.data;
  },
};

export default barbeiroService;