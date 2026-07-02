import { apiClient } from "./api";

export const servicoService = {
  create: async (data) => {
    const response = await apiClient.post("/api/servicos", data);
    return response.data;
  },

  getAll: async (params = {}) => {
    const response = await apiClient.get("/api/servicos", { params });
    return response.data;
  },

  getById: async (id) => {
    const response = await apiClient.get(`/api/servicos/${id}`);
    return response.data;
  },

  update: async (id, data) => {
    const response = await apiClient.put(`/api/servicos/${id}`, data);
    return response.data;
  },

  remove: async (id) => {
    const response = await apiClient.delete(`/api/servicos/${id}`);
    return response.data;
  },
};

export default servicoService;
