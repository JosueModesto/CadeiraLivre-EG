import { apiClient } from "./api";

export const barbeariaService = {
  //Função para criar uma barbearia
  create: async (data) => {
    const response = await apiClient.post("/api/barbearias", data);
    return response.data;
  },
  //Função para obter todas as barbearias
  getAll: async (params = {}) => {
    const response = await apiClient.get("/api/barbearias", { params });
    return response.data;
  },
  //Função para obter uma barbearia específica pelo ID
  getById: async (id) => {
    const response = await apiClient.get(`/api/barbearias/${id}`);
    return response.data;
  },
  //Função para obter a configuração de agendamento de uma barbearia específica
  getAgendamentoConfig: async (id) => {
    const response = await apiClient.get(`/api/barbearias/${id}/agendamento-config`);
    return response.data;
  },

  //Função para obter os agendamentos de uma barbearia específica
  getAgendamentos: async (id, params) => {
    const response = await apiClient.get(`/api/barbearias/${id}/agendamentos`, { params });
    return response.data;
  },

  //Função para obter os próximos agendamentos de uma barbearia específica
  getProximosAgendamentos: async (id, params = {}) => {
    const response = await apiClient.get(`/api/barbearias/${id}/agendamentos/proximos`, { params });
    return response.data;
  },
  //Função para cancelar um agendamento de uma barbearia específica
  cancelAgendamento: async (barbeariaId, agendamentoId) => {
    const response = await apiClient.patch(`/api/barbearias/${barbeariaId}/agendamentos/${agendamentoId}/cancel`);
    return response.data;
  },
  //Função para atualizar uma barbearia específica
  update: async (id, data) => {
    const response = await apiClient.put(`/api/barbearias/${id}`, data);
    return response.data;
  },

  //Função para definir o funcionamento de uma barbearia específica
  setFuncionamento: async (id, data) => {
    const response = await apiClient.put(`/api/barbearias/${id}/funcionamento`, data);
    return response.data;
  },
  //Função para definir o intervalo de uma barbearia específica
  setIntervalo: async (id, data) => {
    const response = await apiClient.put(`/api/barbearias/${id}/intervalo`, data);
    return response.data;
  },
};

export default barbeariaService;