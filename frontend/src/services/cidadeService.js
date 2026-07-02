import { apiClient } from "./api";

export const cidadeService = {
  create: async (data) => {
    const response = await apiClient.post("/api/cidades", data);
    return response.data;
  },

  getAll: async () => {
    const response = await apiClient.get("/api/cidades");
    return response.data;
  },

  getById: async (id) => {
    const response = await apiClient.get(`/api/cidades/${id}`);
    return response.data;
  },

  update: async (id, data) => {
    const response = await apiClient.put(`/api/cidades/${id}`, data);
    return response.data;
  },

  remove: async (id) => {
    const response = await apiClient.delete(`/api/cidades/${id}`);
    return response.data;
  },
};

export default cidadeService;
