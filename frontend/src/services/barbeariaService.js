import { apiClient } from "./api";

export const barbeariaService = {
  getAll: async (params = {}) => {
    const response = await apiClient.get("/api/barbearias", { params });
    return response.data;
  },

  getById: async (id) => {
    const response = await apiClient.get(`/api/barbearias/${id}`);
    return response.data;
  },

  getAgendamentoConfig: async (id) => {
    const response = await apiClient.get(`/api/barbearias/${id}/agendamento-config`);
    return response.data;
  },

  getAgendamentos: async (id, params) => {
    const response = await apiClient.get(`/api/barbearias/${id}/agendamentos`, { params });
    return response.data;
  },

  getProximosAgendamentos: async (id, params = {}) => {
    const response = await apiClient.get(`/api/barbearias/${id}/agendamentos/proximos`, { params });
    return response.data;
  },

  update: async (id, data) => {
    const response = await apiClient.put(`/api/barbearias/${id}`, data);
    return response.data;
  },

  setFuncionamento: async (id, data) => {
    const response = await apiClient.put(`/api/barbearias/${id}/funcionamento`, data);
    return response.data;
  },

  setIntervalo: async (id, data) => {
    const response = await apiClient.put(`/api/barbearias/${id}/intervalo`, data);
    return response.data;
  },
};

export default barbeariaService;