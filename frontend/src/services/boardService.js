import api from "./api";

export const boardService = {
  getWorkspaceBoards: async (workspaceId) => {
    const response = await api.get(`/api/workspaces/${workspaceId}/boards`);
    return response.data;
  },

  getRecentBoards: async (limit = 8) => {
    const response = await api.get(`/api/boards/recent?limit=${limit}`);
    return response.data;
  },

  getBoardById: async (id) => {
    const response = await api.get(`/api/boards/${id}`);
    return response.data;
  },

  createBoard: async (workspaceId, data) => {
    const response = await api.post(`/api/workspaces/${workspaceId}/boards`, data);
    return response.data;
  },

  updateBoard: async (id, data) => {
    const response = await api.patch(`/api/boards/${id}`, data);
    return response.data;
  },

  deleteBoard: async (id) => {
    const response = await api.delete(`/api/boards/${id}`);
    return response.data;
  },

  getBoardCanvas: async (id) => {
    const response = await api.get(`/api/boards/${id}/canvas`);
    return response.data;
  },

  saveBoardCanvas: async (id, data) => {
    const response = await api.put(`/api/boards/${id}/canvas`, data);
    return response.data;
  },
};

