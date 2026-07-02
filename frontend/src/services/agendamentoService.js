import { apiClient } from "./api";

export const agendamentoService = {
  //Função para criar um agendamento
  create: async (data) => {
    const response = await apiClient.post("/api/agendamentos", data);
    return response.data;
  },
  //Função para obter todos os agendamentos do usuário logado
  getMyAppointments: async () => {
    const response = await apiClient.get("/api/agendamentos/my-appointments");
    return response.data;
  },
  //Função para obter os agendamentos de uma barbearia específica
  getAvailableSlots: async (params) => {
    const response = await apiClient.get("/api/agendamentos/available-slots", { params });
    return response.data;
  },

  //Função para verificar a disponibilidade de um horário específico
  checkAvailability: async (params) => {
    const response = await apiClient.get("/api/agendamentos/check-availability", { params });
    return response.data;
  },

  //Função para cancelar um agendamento
  cancel: async (agendamentoId) => {
    const response = await apiClient.patch(`/api/agendamentos/${agendamentoId}/cancel`);
    return response.data;
  },
};

export default agendamentoService;