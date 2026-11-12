import api from "./api";

export const workspaceService = {
  getWorkspaces: async () => {
    const response = await api.get("/api/workspaces");
    return response.data;
  },

  getWorkspaceById: async (id) => {
    const response = await api.get(`/api/workspaces/${id}`);
    return response.data;
  },

  createWorkspace: async (data) => {
    const response = await api.post("/api/workspaces", data);
    return response.data;
  },

  updateWorkspace: async (id, data) => {
    const response = await api.patch(`/api/workspaces/${id}`, data);
    return response.data;
  },

  deleteWorkspace: async (id) => {
    const response = await api.delete(`/api/workspaces/${id}`);
    return response.data;
  },
};

