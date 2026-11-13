import { create } from "zustand";
import { workspaceService } from "../services/workspaceService";
import { boardService } from "../services/boardService";

export const useWorkspaceStore = create((set, get) => ({
  workspaces: [],
  activeWorkspace: null,
  boards: [],
  recentBoards: [],
  isLoadingWorkspaces: false,
  isLoadingBoards: false,
  error: null,

  clearError: () => set({ error: null }),

  fetchWorkspaces: async () => {
    set({ isLoadingWorkspaces: true, error: null });
    try {
      const data = await workspaceService.getWorkspaces();
      const workspaces = data.workspaces || [];
      const currentActive = get().activeWorkspace;

      let nextActive = null;
      if (currentActive && workspaces.some((w) => w.id === currentActive.id)) {
        nextActive = workspaces.find((w) => w.id === currentActive.id);
      } else if (workspaces.length > 0) {
        nextActive = workspaces[0];
      }

      set({
        workspaces,
        activeWorkspace: nextActive,
        isLoadingWorkspaces: false,
      });

      if (nextActive) {
        get().fetchBoards(nextActive.id);
      } else {
        set({ boards: [] });
      }

      get().fetchRecentBoards();
    } catch (err) {
      console.error("Failed to fetch workspaces:", err);
      set({
        error: err.response?.data?.message || "Failed to load workspaces",
        isLoadingWorkspaces: false,
      });
    }
  },

  selectWorkspace: (workspace) => {
    set({ activeWorkspace: workspace, error: null });
    if (workspace?.id) {
      get().fetchBoards(workspace.id);
    }
  },

  fetchBoards: async (workspaceId) => {
    if (!workspaceId) return;
    set({ isLoadingBoards: true, error: null });
    try {
      const data = await boardService.getWorkspaceBoards(workspaceId);
      set({ boards: data.boards || [], isLoadingBoards: false });
    } catch (err) {
      console.error("Failed to fetch boards:", err);
      set({
        error: err.response?.data?.message || "Failed to load boards",
        isLoadingBoards: false,
      });
    }
  },

  fetchRecentBoards: async () => {
    try {
      const data = await boardService.getRecentBoards(6);
      set({ recentBoards: data.boards || [] });
    } catch (err) {
      console.error("Failed to fetch recent boards:", err);
    }
  },

  createWorkspace: async (name) => {
    set({ error: null });
    try {
      const data = await workspaceService.createWorkspace({ name });
      const newWorkspace = data.workspace;
      set((state) => ({
        workspaces: [newWorkspace, ...state.workspaces],
        activeWorkspace: newWorkspace,
        boards: [],
      }));
      return newWorkspace;
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to create workspace";
      set({ error: msg });
      throw new Error(msg, { cause: err });
    }
  },

  updateWorkspace: async (id, name) => {
    set({ error: null });
    try {
      const data = await workspaceService.updateWorkspace(id, { name });
      const updated = data.workspace;
      set((state) => ({
        workspaces: state.workspaces.map((w) => (w.id === id ? { ...w, ...updated } : w)),
        activeWorkspace: state.activeWorkspace?.id === id ? { ...state.activeWorkspace, ...updated } : state.activeWorkspace,
      }));
      return updated;
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to update workspace";
      set({ error: msg });
      throw new Error(msg, { cause: err });
    }
  },

  deleteWorkspace: async (id) => {
    set({ error: null });
    try {
      await workspaceService.deleteWorkspace(id);
      const remaining = get().workspaces.filter((w) => w.id !== id);
      const nextActive = remaining.length > 0 ? remaining[0] : null;

      set({
        workspaces: remaining,
        activeWorkspace: nextActive,
      });

      if (nextActive) {
        get().fetchBoards(nextActive.id);
      } else {
        set({ boards: [] });
      }

      get().fetchRecentBoards();
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to delete workspace";
      set({ error: msg });
      throw new Error(msg, { cause: err });
    }
  },

  createBoard: async (workspaceId, { title, description }) => {
    set({ error: null });
    try {
      const data = await boardService.createBoard(workspaceId, { title, description });
      const newBoard = data.board;

      set((state) => ({
        boards: [newBoard, ...state.boards],
        workspaces: state.workspaces.map((w) =>
          w.id === workspaceId
            ? { ...w, _count: { boards: (w._count?.boards || 0) + 1 } }
            : w
        ),
      }));

      get().fetchRecentBoards();
      return newBoard;
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to create board";
      set({ error: msg });
      throw new Error(msg, { cause: err });
    }
  },

  updateBoard: async (id, updateData) => {
    try {
      const data = await boardService.updateBoard(id, updateData);
      const updated = data.board;

      set((state) => ({
        boards: state.boards.map((b) => (b.id === id ? { ...b, ...updated } : b)),
        recentBoards: state.recentBoards.map((b) => (b.id === id ? { ...b, ...updated } : b)),
      }));

      return updated;
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to update board";
      set({ error: msg });
      throw new Error(msg, { cause: err });
    }
  },

  toggleFavorite: async (board) => {
    const nextState = !board.isFavorite;
    set((state) => ({
      boards: state.boards.map((b) => (b.id === board.id ? { ...b, isFavorite: nextState } : b)),
      recentBoards: state.recentBoards.map((b) => (b.id === board.id ? { ...b, isFavorite: nextState } : b)),
    }));

    try {
      await boardService.updateBoard(board.id, { isFavorite: nextState });
    } catch (err) {
      set((state) => ({
        boards: state.boards.map((b) => (b.id === board.id ? { ...b, isFavorite: board.isFavorite } : b)),
        recentBoards: state.recentBoards.map((b) => (b.id === board.id ? { ...b, isFavorite: board.isFavorite } : b)),
      }));
      console.error("Failed to toggle favorite:", err);
    }
  },

  deleteBoard: async (id) => {
    set({ error: null });
    try {
      await boardService.deleteBoard(id);
      const activeWs = get().activeWorkspace;

      set((state) => ({
        boards: state.boards.filter((b) => b.id !== id),
        recentBoards: state.recentBoards.filter((b) => b.id !== id),
        workspaces: state.workspaces.map((w) =>
          w.id === activeWs?.id
            ? { ...w, _count: { boards: Math.max(0, (w._count?.boards || 1) - 1) } }
            : w
        ),
      }));
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to delete board";
      set({ error: msg });
      throw new Error(msg, { cause: err });
    }
  },
}));
