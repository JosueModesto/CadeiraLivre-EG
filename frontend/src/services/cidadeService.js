import { apiClient } from "./api";

export const cidadeService = {
  getAll: async () => {
    const response = await apiClient.get("/api/cidades");
    return response.data;
  },
};

export default cidadeService;
