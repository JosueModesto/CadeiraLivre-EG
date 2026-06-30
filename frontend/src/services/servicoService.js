import { apiClient } from "./api";

export const servicoService = {
  getAll: async (params = {}) => {
    const response = await apiClient.get("/api/servicos", { params });
    return response.data;
  },

  getById: async (id) => {
    const response = await apiClient.get(`/api/servicos/${id}`);
    return response.data;
  },
};

export default servicoService;