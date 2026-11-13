import { useEffect, useState, useMemo } from "react";
import { useWorkspaceStore } from "../../stores/workspaceStore";
import Navbar from "./components/Navbar";
import WorkspaceSidebar from "./components/WorkspaceSidebar";
import BoardCard from "./components/BoardCard";
import RecentBoards from "./components/RecentBoards";
import WorkspaceModal from "./components/WorkspaceModal";
import BoardModal from "./components/BoardModal";
import ConfirmModal from "./components/ConfirmModal";

function Dashboard() {
  const {
    workspaces,
    activeWorkspace,
    boards,
    recentBoards,
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

  const [isWorkspaceModalOpen, setIsWorkspaceModalOpen] = useState(false);
  const [editingWorkspace, setEditingWorkspace] = useState(null);

  const [isBoardModalOpen, setIsBoardModalOpen] = useState(false);
  const [editingBoard, setEditingBoard] = useState(null);

  const [confirmDeleteWorkspace, setConfirmDeleteWorkspace] = useState(null);
  const [confirmDeleteBoard, setConfirmDeleteBoard] = useState(null);

  useEffect(() => {
    fetchWorkspaces();
  }, [fetchWorkspaces]);

  const filteredBoards = useMemo(() => {
    let result = [...boards];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (b) =>
          b.title.toLowerCase().includes(q) ||
          (b.description && b.description.toLowerCase().includes(q))
      );
    }

    if (activeTab === "starred") {
      result = result.filter((b) => b.isFavorite);
    }

    if (sortBy === "name") {
      result.sort((a, b) => a.title.localeCompare(b.title));
    } else {
      result.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
    }

    return result;
  }, [boards, searchQuery, activeTab, sortBy]);

  const handleOpenCreateWorkspace = () => {
    setEditingWorkspace(null);
    setIsWorkspaceModalOpen(true);
  };

  const handleOpenRenameWorkspace = (ws) => {
    setEditingWorkspace(ws);
    setIsWorkspaceModalOpen(true);
  };

  const handleSubmitWorkspace = async (name) => {
    if (editingWorkspace) {
      await updateWorkspace(editingWorkspace.id, name);
    } else {
      await createWorkspace(name);
    }
  };

  const handleOpenCreateBoard = () => {
    if (!activeWorkspace) {
      setIsWorkspaceModalOpen(true);
      return;
    }
    setEditingBoard(null);
    setIsBoardModalOpen(true);
  };

  const handleOpenRenameBoard = (b) => {
    setEditingBoard(b);
    setIsBoardModalOpen(true);
  };

  const handleSubmitBoard = async (data) => {
    if (editingBoard) {
      await updateBoard(editingBoard.id, data);
    } else {
      await createBoard(activeWorkspace.id, data);
    }
  };

  const totalStarredCount = boards.filter((b) => b.isFavorite).length;

  return (
    <div className="flex min-h-screen flex-col bg-[#f7f6f2] text-[#171716]">
      <Navbar
        onOpenCreateWorkspace={handleOpenCreateWorkspace}
        onOpenCreateBoard={handleOpenCreateBoard}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        isMobileSidebarOpen={isMobileSidebarOpen}
        onToggleMobileSidebar={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
        activeWorkspaceName={activeWorkspace?.name}
      />

      {error && (
        <div className="mx-4 mt-3 flex items-center justify-between rounded-xl border border-red-300 bg-red-50 px-4 py-2.5 text-xs text-red-800 shadow-xs sm:mx-6">
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

      <div className="flex flex-1 w-full min-h-[calc(100vh-64px)]">
        <WorkspaceSidebar
          workspaces={workspaces}
          activeWorkspace={activeWorkspace}
          onSelectWorkspace={selectWorkspace}
          onOpenCreateWorkspace={handleOpenCreateWorkspace}
          onOpenRenameWorkspace={handleOpenRenameWorkspace}
          onOpenDeleteWorkspace={(ws) => setConfirmDeleteWorkspace(ws)}
          isLoading={isLoadingWorkspaces}
          isOpenMobile={isMobileSidebarOpen}
          onCloseMobile={() => setIsMobileSidebarOpen(false)}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0 bg-[#f7f6f2]">
          {!searchQuery && recentBoards.length > 0 && (
            <RecentBoards recentBoards={recentBoards} />
          )}

          {activeWorkspace ? (
            <div>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-neutral-200/90 pb-5">
                <div>
                  <div className="flex items-center gap-2.5">
                    <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-900">
                      {activeWorkspace.name}
                    </h1>
                    <button
                      type="button"
                      onClick={() => handleOpenRenameWorkspace(activeWorkspace)}
                      className="flex h-7 w-7 items-center justify-center rounded-lg text-neutral-400 hover:bg-white hover:text-neutral-900 shadow-2xs"
                      title="Rename"
                    >
                      ✎
                    </button>
                  </div>
                  <p className="mt-1 text-xs text-neutral-500 font-medium">
                    {boards.length} {boards.length === 1 ? "whiteboard" : "whiteboards"} in workspace
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleOpenCreateBoard}
                    className="flex items-center gap-2 rounded-xl bg-[#171716] px-4 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-[#d9786b] transition-all"
                  >
                    <span>+ New Board</span>
                  </button>
                </div>
              </div>

              <div className="mt-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3">
                <div className="inline-flex items-center rounded-xl border border-neutral-200 bg-white p-1 shadow-2xs self-start">
                  <button
                    type="button"
                    onClick={() => setActiveTab("all")}
                    className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                      activeTab === "all"
                        ? "bg-[#171716] text-white shadow-xs"
                        : "text-neutral-600 hover:text-neutral-950"
                    }`}
                  >
                    All Boards ({boards.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab("starred")}
                    className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                      activeTab === "starred"
                        ? "bg-[#171716] text-white shadow-xs"
                        : "text-neutral-600 hover:text-neutral-950"
                    }`}
                  >
                    <span className="text-amber-500">★</span>
                    <span>Starred ({totalStarredCount})</span>
                  </button>
                </div>

                <div className="flex items-center gap-2 text-xs text-neutral-500 self-end sm:self-auto">
                  <span className="font-medium">Sort by:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="rounded-lg border border-neutral-200 bg-white px-2.5 py-1.5 text-xs font-medium text-neutral-800 shadow-2xs outline-none focus:border-neutral-900 cursor-pointer"
                  >
                    <option value="recent">Recently Updated</option>
                    <option value="name">Alphabetical</option>
                  </select>
                </div>
              </div>

              {isLoadingBoards ? (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 mt-3">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-52 rounded-2xl border border-neutral-200 bg-white p-4 shadow-2xs animate-pulse">
                      <div className="h-32 rounded-xl bg-neutral-100" />
                      <div className="mt-3.5 h-4 w-3/4 rounded-md bg-neutral-200" />
                    </div>
                  ))}
                </div>
              ) : filteredBoards.length === 0 ? (
                <div className="mt-6 flex flex-col items-center justify-center rounded-2xl border border-dashed border-neutral-300 bg-white/80 px-6 py-16 text-center shadow-2xs">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-xs text-xl">
                    ✏
                  </div>
                  <h3 className="mt-4 text-sm font-bold text-neutral-900">
                    {searchQuery
                      ? `No boards match "${searchQuery}"`
                      : activeTab === "starred"
                      ? "No starred boards yet"
                      : "No boards in this workspace"}
                  </h3>
                  <p className="mt-1 text-xs text-neutral-500 max-w-sm">
                    {searchQuery
                      ? "Try searching for a different keyword."
                      : activeTab === "starred"
                      ? "Star your favorite boards to easily find them here."
                      : "Create your first board to start drawing diagrams and ideas."}
                  </p>
                  {!searchQuery && activeTab !== "starred" && (
                    <button
                      type="button"
                      onClick={handleOpenCreateBoard}
                      className="mt-5 rounded-xl bg-[#171716] px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-[#d9786b] transition-all"
                    >
                      + Create First Board
                    </button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 mt-3">
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
            <div className="mt-8 flex flex-col items-center justify-center rounded-2xl border border-dashed border-neutral-300 bg-white/80 px-6 py-20 text-center shadow-xs">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#171716] text-white shadow-md text-2xl">
                ✦
              </div>
              <h2 className="mt-4 text-base sm:text-lg font-bold text-neutral-900">
                Welcome to Forma
              </h2>
              <p className="mt-2 max-w-md text-xs sm:text-sm text-neutral-500">
                Workspaces help you organize boards by project or team.
                Create your first workspace to start sketching.
              </p>
              <button
                type="button"
                onClick={handleOpenCreateWorkspace}
                className="mt-6 rounded-xl bg-[#171716] px-5 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-[#d9786b] transition-all"
              >
                + Create Workspace
              </button>
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
