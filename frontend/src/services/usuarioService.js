import { apiClient } from "./api";

export const usuarioService = {
  getAll: async () => {
    const response = await apiClient.get("/api/usuarios");
    return response.data;
  },

  getById: async (id) => {
    const response = await apiClient.get(`/api/usuarios/${id}`);
    return response.data;
  },

  update: async (id, data) => {
    const response = await apiClient.put(`/api/usuarios/${id}`, data);
    return response.data;
  },
};

export default usuarioService;