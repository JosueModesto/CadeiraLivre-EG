import { apiClient } from "./api";

export const agendamentoService = {
  create: async (data) => {
    const response = await apiClient.post("/api/agendamentos", data);
    return response.data;
  },

  getMyAppointments: async () => {
    const response = await apiClient.get("/api/agendamentos/my-appointments");
    return response.data;
  },

  getAvailableSlots: async (params) => {
    const response = await apiClient.get("/api/agendamentos/available-slots", { params });
    return response.data;
  },

  checkAvailability: async (params) => {
    const response = await apiClient.get("/api/agendamentos/check-availability", { params });
    return response.data;
  },
};

export default agendamentoService;