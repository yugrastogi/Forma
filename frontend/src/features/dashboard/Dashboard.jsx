import { useEffect, useState, useMemo, useCallback } from "react";
import { useWorkspaceStore } from "../../stores/workspaceStore";
import { boardService } from "../../services/boardService";

import Navbar from "./components/Navbar";
import WorkspaceSidebar from "./components/WorkspaceSidebar";
import BoardCard from "./components/BoardCard";
import WorkspaceModal from "./components/WorkspaceModal";
import BoardModal from "./components/BoardModal";
import ConfirmModal from "./components/ConfirmModal";

function Dashboard() {
  const {
    workspaces,
    activeWorkspace,
    boards,
    isLoadingWorkspaces,
    isLoadingBoards,
    error,
    clearError,
    fetchWorkspaces,
    selectWorkspace,
    createWorkspace,
    updateWorkspace,
    deleteWorkspace,
    createBoard,
    updateBoard,
    toggleFavorite,
    deleteBoard,
  } = useWorkspaceStore();

  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [sortBy, setSortBy] = useState("recent");
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Shared boards state
  const [isSharedView, setIsSharedView] = useState(false);
  const [sharedBoards, setSharedBoards] = useState([]);
  const [isLoadingShared, setIsLoadingShared] = useState(false);

  const [isWorkspaceModalOpen, setIsWorkspaceModalOpen] = useState(false);
  const [editingWorkspace, setEditingWorkspace] = useState(null);

  const [isBoardModalOpen, setIsBoardModalOpen] = useState(false);
  const [editingBoard, setEditingBoard] = useState(null);

  const [confirmDeleteWorkspace, setConfirmDeleteWorkspace] = useState(null);
  const [confirmDeleteBoard, setConfirmDeleteBoard] = useState(null);

  const fetchSharedBoards = useCallback(async () => {
    setIsLoadingShared(true);
    try {
      const data = await boardService.getRecentBoards(20);
      const onlyShared = (data.boards || []).filter((b) => b.role !== "OWNER");
      setSharedBoards(onlyShared);
    } catch (err) {
      console.error("Failed to load shared boards:", err);
    } finally {
      setIsLoadingShared(false);
    }
  }, []);

  useEffect(() => {
    fetchWorkspaces();
    fetchSharedBoards();
  }, [fetchWorkspaces, fetchSharedBoards]);

  const handleSelectWorkspace = (workspace) => {
    setIsSharedView(false);
    selectWorkspace(workspace);
  };

  const displayedSourceBoards = isSharedView ? sharedBoards : boards;

  const filteredBoards = useMemo(() => {
    let result = [...displayedSourceBoards];

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter(
        (board) =>
          board.title.toLowerCase().includes(query) ||
          (board.description &&
            board.description.toLowerCase().includes(query))
      );
    }

    if (!isSharedView && activeTab === "starred") {
      result = result.filter((board) => board.isFavorite);
    }

    if (sortBy === "name") {
      result.sort((a, b) => a.title.localeCompare(b.title));
    } else {
      result.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
    }

    return result;
  }, [displayedSourceBoards, isSharedView, searchQuery, activeTab, sortBy]);

  // Workspace actions
  const handleOpenCreateWorkspace = () => {
    setEditingWorkspace(null);
    setIsWorkspaceModalOpen(true);
  };

  const handleOpenRenameWorkspace = (workspace) => {
    setEditingWorkspace(workspace);
    setIsWorkspaceModalOpen(true);
  };

  const handleSubmitWorkspace = async (name) => {
    if (editingWorkspace) {
      await updateWorkspace(editingWorkspace.id, name);
    } else {
      await createWorkspace(name);
    }
  };

  // Board actions
  const handleOpenCreateBoard = () => {
    if (!activeWorkspace) return;
    setEditingBoard(null);
    setIsBoardModalOpen(true);
  };

  const handleOpenRenameBoard = (board) => {
    setEditingBoard(board);
    setIsBoardModalOpen(true);
  };

  const handleSubmitBoard = async (data) => {
    if (editingBoard) {
      await updateBoard(editingBoard.id, data);
    } else if (activeWorkspace) {
      await createBoard(activeWorkspace.id, data);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#f7f6f2] text-[#171716]">
      <Navbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        isMobileSidebarOpen={isMobileSidebarOpen}
        onToggleMobileSidebar={() =>
          setIsMobileSidebarOpen(!isMobileSidebarOpen)
        }
      />

      {error && (
        <div className="mx-4 mt-3 flex items-center justify-between border border-red-300 bg-red-50 px-4 py-2.5 text-xs text-red-800 sm:mx-6">
          <span>{error}</span>
          <button
            type="button"
            onClick={clearError}
            className="font-bold text-red-700 hover:text-red-950"
          >
            Dismiss
          </button>
        </div>
      )}

      <div className="flex min-h-[calc(100vh-64px)] w-full flex-1">
        <WorkspaceSidebar
          workspaces={workspaces}
          activeWorkspace={isSharedView ? null : activeWorkspace}
          onSelectWorkspace={handleSelectWorkspace}
          onOpenCreateWorkspace={handleOpenCreateWorkspace}
          onOpenRenameWorkspace={handleOpenRenameWorkspace}
          onOpenDeleteWorkspace={(workspace) =>
            setConfirmDeleteWorkspace(workspace)
          }
          isLoading={isLoadingWorkspaces}
          isOpenMobile={isMobileSidebarOpen}
          onCloseMobile={() => setIsMobileSidebarOpen(false)}
        />

        <main className="min-w-0 flex-1 bg-[#f7f6f2] p-4 sm:p-6 lg:p-8">
          {/* Top View Switcher: Active Workspace vs Shared With Me */}
          <div className="mb-5 flex items-center gap-2 border-b border-neutral-200 pb-3">
            <button
              type="button"
              onClick={() => setIsSharedView(false)}
              className={`px-3 py-1.5 text-xs font-semibold transition-colors cursor-pointer ${
                !isSharedView
                  ? "bg-[#171716] text-white"
                  : "bg-white text-neutral-700 border border-neutral-200 hover:border-neutral-400"
              }`}
            >
              My Workspaces
            </button>
            <button
              type="button"
              onClick={() => {
                setIsSharedView(true);
                fetchSharedBoards();
              }}
              className={`flex items-center gap-2 px-3 py-1.5 text-xs font-semibold transition-colors cursor-pointer ${
                isSharedView
                  ? "bg-[#171716] text-white"
                  : "bg-white text-neutral-700 border border-neutral-200 hover:border-neutral-400"
              }`}
            >
              <span>Shared with me</span>
              {sharedBoards.length > 0 && (
                <span className="rounded-full bg-[#D9786B] px-1.5 py-0.5 text-[10px] font-bold text-white">
                  {sharedBoards.length}
                </span>
              )}
            </button>
          </div>

          {isSharedView ? (
            <div>
              <div className="flex flex-col gap-3 border-b border-neutral-200 pb-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="inline-block">
                    <h1 className="text-xl font-bold tracking-tight text-neutral-900 sm:text-2xl">
                      Shared with me
                    </h1>
                    <div className="mt-2 h-[2px] w-full bg-[#D9786B]/60" />
                  </div>
                  <p className="mt-2 text-xs font-medium text-neutral-500">
                    {sharedBoards.length}{" "}
                    {sharedBoards.length === 1 ? "board" : "boards"} shared with
                    you
                  </p>
                </div>

                <div className="flex items-center gap-2 text-xs text-neutral-500">
                  <span className="font-medium">Sort by:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="border border-neutral-200 bg-white px-2.5 py-1.5 text-xs font-medium text-neutral-800 outline-none focus:border-[#D9786B]"
                  >
                    <option value="recent">Recently Updated</option>
                    <option value="name">Alphabetical</option>
                  </select>
                </div>
              </div>

              {isLoadingShared ? (
                <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {[1, 2].map((i) => (
                    <div
                      key={i}
                      className="h-52 animate-pulse border border-neutral-200 bg-white p-4"
                    >
                      <div className="h-32 bg-neutral-100" />
                      <div className="mt-3.5 h-4 w-3/4 bg-neutral-200" />
                    </div>
                  ))}
                </div>
              ) : filteredBoards.length === 0 ? (
                <div className="mt-6 flex flex-col items-center justify-center border border-dashed border-neutral-300 bg-white/80 px-6 py-16 text-center">
                  <h3 className="text-sm font-bold text-neutral-900">
                    No shared boards yet
                  </h3>
                  <p className="mt-1 max-w-sm text-xs text-neutral-500">
                    Boards that other users share with your email will appear
                    here automatically.
                  </p>
                </div>
              ) : (
                <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {filteredBoards.map((board) => (
                    <BoardCard
                      key={board.id}
                      board={board}
                      onToggleFavorite={toggleFavorite}
                      onOpenRenameBoard={handleOpenRenameBoard}
                      onOpenDeleteBoard={(b) => setConfirmDeleteBoard(b)}
                    />
                  ))}
                </div>
              )}
            </div>
          ) : activeWorkspace ? (
            <div>
              {/* Workspace heading */}
              <div className="flex flex-col gap-3 border-b border-neutral-200 pb-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="inline-block">
                    <h1 className="text-xl font-bold tracking-tight text-neutral-900 sm:text-2xl">
                      {activeWorkspace.name}
                    </h1>
                    <div className="mt-2 h-[2px] w-full bg-[#D9786B]/60" />
                  </div>

                  <p className="mt-2 text-xs font-medium text-neutral-500">
                    {boards.length}{" "}
                    {boards.length === 1 ? "whiteboard" : "whiteboards"} in
                    workspace
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleOpenCreateBoard}
                  className="flex items-center justify-center gap-2 bg-[#171716] px-4 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-[#D9786B]"
                >
                  + New Board
                </button>
              </div>

              {/* Filters and sorting */}
              <div className="mt-5 flex flex-col justify-between gap-3 pb-3 sm:flex-row sm:items-center">
                <div className="inline-flex self-start border border-neutral-200 bg-white p-1">
                  <button
                    type="button"
                    onClick={() => setActiveTab("all")}
                    className={`px-3 py-1.5 text-xs font-semibold transition-colors ${
                      activeTab === "all"
                        ? "bg-[#D9786B] text-white"
                        : "text-neutral-600 hover:text-[#D9786B]"
                    }`}
                  >
                    All Boards ({boards.length})
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab("starred")}
                    className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold transition-colors ${
                      activeTab === "starred"
                        ? "bg-[#D9786B] text-white"
                        : "text-neutral-600 hover:text-[#D9786B]"
                    }`}
                  >
                    <span className="text-amber-500">★</span>
                    Starred ({boards.filter((b) => b.isFavorite).length})
                  </button>
                </div>

                <div className="flex items-center gap-2 self-end text-xs text-neutral-500 sm:self-auto">
                  <span className="font-medium">Sort by:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="border border-neutral-200 bg-white px-2.5 py-1.5 text-xs font-medium text-neutral-800 outline-none transition-colors focus:border-[#D9786B]"
                  >
                    <option value="recent">Recently Updated</option>
                    <option value="name">Alphabetical</option>
                  </select>
                </div>
              </div>

              {isLoadingBoards ? (
                <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="h-52 animate-pulse border border-neutral-200 bg-white p-4"
                    >
                      <div className="h-32 bg-neutral-100" />
                      <div className="mt-3.5 h-4 w-3/4 bg-neutral-200" />
                    </div>
                  ))}
                </div>
              ) : filteredBoards.length === 0 ? (
                <div className="mt-6 flex flex-col items-center justify-center border border-dashed border-neutral-300 bg-white/80 px-6 py-16 text-center">
                  <div className="flex h-14 w-14 items-center justify-center bg-[#171716] text-xl font-black tracking-tight text-white">
                    f.
                  </div>
                  <h3 className="mt-4 text-sm font-bold text-neutral-900">
                    {searchQuery
                      ? `No boards match "${searchQuery}"`
                      : activeTab === "starred"
                      ? "No starred boards yet"
                      : "No boards in this workspace"}
                  </h3>
                  <p className="mt-1 max-w-sm text-xs text-neutral-500">
                    {searchQuery
                      ? "Try searching for a different keyword."
                      : activeTab === "starred"
                      ? "Star your favorite boards to find them here."
                      : "Create your first board to start drawing."}
                  </p>
                </div>
              ) : (
                <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {filteredBoards.map((board) => (
                    <BoardCard
                      key={board.id}
                      board={board}
                      onToggleFavorite={toggleFavorite}
                      onOpenRenameBoard={handleOpenRenameBoard}
                      onOpenDeleteBoard={(b) => setConfirmDeleteBoard(b)}
                    />
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="mt-8 flex flex-col items-center justify-center border border-dashed border-neutral-300 bg-white/80 px-6 py-20 text-center">
              <div className="flex h-14 w-14 items-center justify-center bg-[#171716] text-xl font-black tracking-tight text-white">
                f.
              </div>
              <h2 className="mt-4 text-base font-bold text-neutral-900 sm:text-lg">
                Welcome to Forma
              </h2>
              <p className="mt-2 max-w-md text-xs text-neutral-500 sm:text-sm">
                Workspaces help you organize boards by project or team. Select a
                workspace to see your boards.
              </p>
              <p className="mt-4 text-xs font-medium text-neutral-500">
                Use the New Workspace button in the sidebar to create one.
              </p>
            </div>
          )}
        </main>
      </div>

      <WorkspaceModal
        isOpen={isWorkspaceModalOpen}
        onClose={() => setIsWorkspaceModalOpen(false)}
        onSubmit={handleSubmitWorkspace}
        initialValue={editingWorkspace?.name || ""}
        isEdit={!!editingWorkspace}
      />

      <BoardModal
        isOpen={isBoardModalOpen}
        onClose={() => setIsBoardModalOpen(false)}
        onSubmit={handleSubmitBoard}
        initialData={{
          title: editingBoard?.title || "",
          description: editingBoard?.description || "",
        }}
        workspaceName={activeWorkspace?.name || ""}
        isEdit={!!editingBoard}
      />

      <ConfirmModal
        isOpen={!!confirmDeleteWorkspace}
        onClose={() => setConfirmDeleteWorkspace(null)}
        onConfirm={() => deleteWorkspace(confirmDeleteWorkspace.id)}
        title={`Delete "${confirmDeleteWorkspace?.name}"?`}
        message={`Are you sure you want to delete this workspace? This will permanently delete all ${
          confirmDeleteWorkspace?._count?.boards || 0
        } boards inside it.`}
        confirmLabel="Delete Workspace"
        isDanger={true}
      />

      <ConfirmModal
        isOpen={!!confirmDeleteBoard}
        onClose={() => setConfirmDeleteBoard(null)}
        onConfirm={() => deleteBoard(confirmDeleteBoard.id)}
        title={`Delete "${confirmDeleteBoard?.title}"?`}
        message="Are you sure you want to delete this board? All canvas elements will be permanently deleted."
        confirmLabel="Delete Board"
        isDanger={true}
      />
    </div>
  );
}

export default Dashboard;