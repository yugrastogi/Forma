
import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { boardService } from "../../services/boardService";
import CanvasEditor from "../canvas/CanvasEditor";
import ShareDialog from "../collaboration/components/ShareDialog";

function BoardView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const canvasRef = useRef(null);

  const [board, setBoard] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleInput, setTitleInput] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState("saved");
  const [lastSaved, setLastSaved] = useState(null);

  const [isShareOpen, setIsShareOpen] = useState(false);
  const [collabState, setCollabState] = useState({
    connectionStatus: "connecting",
    activeUsers: [],
    errorMessage: "",
  });

  const isOwner = board?.userRole === "OWNER";
  const isViewer = board?.userRole === "VIEWER";

  useEffect(() => {
    let isMounted = true;

    const fetchCanvas = async () => {
      try {
        const data = await boardService.getBoardCanvas(id);

        if (!isMounted) return;

        setBoard(data);
        setTitleInput(data.title);
        setLastSaved(
          data.updatedAt ? new Date(data.updatedAt) : new Date()
        );
      } catch (err) {
        if (!isMounted) return;

        setError(
          err.response?.data?.message || "Failed to load board"
        );
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchCanvas();

    return () => {
      isMounted = false;
    };
  }, [id]);

  const handleCollaborationChange = useCallback((info) => {
    setCollabState(info);
  }, []);

  const handleSaveTitle = async () => {
    if (!titleInput.trim() || titleInput === board?.title) {
      setIsEditingTitle(false);
      return;
    }

    try {
      const result = await boardService.updateBoard(id, {
        title: titleInput.trim(),
      });

      setBoard((prev) => ({
        ...prev,
        title: result.board.title,
      }));

      setIsEditingTitle(false);
    } catch (err) {
      alert(
        err.response?.data?.message || "Failed to rename board"
      );
    }
  };

  const formatLastSaved = () => {
    if (saveStatus === "saving") return "Saving...";
    if (saveStatus === "unsaved") return "Unsaved changes";
    if (saveStatus === "error") return "Save failed";

    if (!lastSaved) return "Not saved yet";

    return `Last saved at ${lastSaved.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    })}`;
  };

  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f7f6f2]">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center bg-[#171716] text-sm font-bold text-white">
            f.
          </span>
          <span className="text-sm font-medium tracking-wide text-neutral-600">
            Loading Board...
          </span>
        </div>
      </main>
    );
  }

  if (error || !board) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-[#f7f6f2] p-6 text-center">
        <div className="w-full max-w-md border border-neutral-200 bg-white p-8">
          <h2 className="text-base font-bold text-neutral-900">
            {error || "Board Not Found"}
          </h2>
          <p className="mt-1 text-xs leading-relaxed text-neutral-500">
            The requested board does not exist or you do not have
            permission to view it.
          </p>
          <button
            type="button"
            onClick={() => navigate("/")}
            className="mt-5 bg-[#171716] px-4 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-[#D9786B]"
          >
            Return to Dashboard
          </button>
        </div>
      </main>
    );
  }

  return (
    <div className="flex h-screen flex-col bg-[#f7f6f2] text-[#171716]">
      <header className="z-20 flex min-h-14 shrink-0 items-center justify-between gap-3 border-b border-neutral-200 bg-white px-4">
        {/* Left section */}
        <div className="flex min-w-0 items-center gap-2 sm:gap-3">
          <Link
            to="/"
            className="flex shrink-0 items-center gap-2 text-xs font-semibold text-neutral-600 transition-colors hover:text-[#D9786B]"
            title="Back to Dashboard"
          >
            <span className="flex h-8 w-8 items-center justify-center border border-neutral-200 bg-white text-sm transition-colors hover:border-[#D9786B] hover:text-[#D9786B]">
              ←
            </span>
            <span className="hidden md:inline">Dashboard</span>
          </Link>

          <span className="text-neutral-300">/</span>

          {board.workspace?.name && (
            <>
              <span className="max-w-[120px] truncate text-xs font-medium text-neutral-500">
                {board.workspace.name}
              </span>
              <span className="text-neutral-300">/</span>
            </>
          )}

          {isOwner ? (
            isEditingTitle ? (
              <div className="flex items-center gap-1.5">
                <input
                  type="text"
                  value={titleInput}
                  onChange={(e) => setTitleInput(e.target.value)}
                  onBlur={handleSaveTitle}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSaveTitle();

                    if (e.key === "Escape") {
                      setTitleInput(board.title);
                      setIsEditingTitle(false);
                    }
                  }}
                  autoFocus
                  className="w-32 border border-[#D9786B] bg-white px-2 py-1 text-xs font-bold text-neutral-950 outline-none sm:w-auto sm:text-sm"
                />
                <button
                  type="button"
                  onClick={handleSaveTitle}
                  className="bg-[#171716] px-2.5 py-1 text-xs font-semibold text-white transition-colors hover:bg-[#D9786B]"
                >
                  Save
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setIsEditingTitle(true)}
                className="flex min-w-0 items-center gap-1.5 px-1 py-1 text-xs font-bold text-neutral-950 transition-colors hover:text-[#D9786B] sm:text-sm"
                title="Click to rename board"
              >
                <span className="truncate">{board.title}</span>
                <span className="text-xs text-neutral-400">✎</span>
              </button>
            )
          ) : (
            <div className="flex min-w-0 items-center gap-2">
              <span className="truncate text-xs font-bold text-neutral-950 sm:text-sm">
                {board.title}
              </span>
              <span
                className={`px-1.5 py-0.5 text-[10px] font-medium ${
                  isViewer
                    ? "bg-neutral-100 text-neutral-600"
                    : "bg-[#D9786B]/10 text-[#B65C50]"
                }`}
              >
                {board.userRole}
              </span>
            </div>
          )}
        </div>

        {/* Right section */}
        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          {/* Live status */}
          <div className="flex items-center gap-2 pr-2 text-[11px] font-semibold uppercase tracking-wide">
            <span
              className={`h-2 w-2 rounded-full ${
                collabState.connectionStatus === "connected"
                  ? "bg-[#D9786B]"
                  : collabState.connectionStatus === "reconnecting" ||
                    collabState.connectionStatus === "connecting"
                  ? "bg-amber-500"
                  : "bg-neutral-400"
              }`}
            />
            <span className="text-neutral-700">
              {collabState.connectionStatus === "connected"
                ? "Live"
                : collabState.connectionStatus === "reconnecting"
                ? "Reconnecting"
                : collabState.connectionStatus === "connecting"
                ? "Connecting"
                : "Offline"}
            </span>
          </div>

          <span className="h-7 w-px bg-neutral-200" />

          {/* Last saved */}
          {!isViewer && (
            <div
              className={`whitespace-nowrap px-1 text-[11px] font-medium ${
                saveStatus === "error"
                  ? "text-red-500"
                  : saveStatus === "unsaved"
                  ? "text-amber-600"
                  : "text-neutral-500"
              }`}
            >
              {formatLastSaved()}
            </div>
          )}

          <span className="h-7 w-px bg-neutral-200" />

          {/* Avatar and Share */}
          <div className="flex items-center gap-2">
            <div
              title={board.user?.name || board.user?.email || "You"}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-[#D9786B] text-xs font-bold text-white"
            >
              {(board.user?.name || board.user?.email || "Y")
                .charAt(0)
                .toUpperCase()}
            </div>

            <button
              type="button"
              onClick={() => setIsShareOpen(true)}
              className="border border-neutral-300 bg-white px-3 py-1.5 text-xs font-semibold text-neutral-800 transition-colors hover:border-neutral-300 hover:bg-[#FBECE9] hover:text-[#AD5146]"
            >
              Share
            </button>
          </div>

          <span className="h-7 w-px bg-neutral-200" />

          {/* Save */}
          {!isViewer ? (
            <button
              type="button"
              onClick={() => canvasRef.current?.saveCanvas()}
              disabled={isSaving}
              className="bg-[#171716] px-3.5 py-2 text-xs font-semibold text-white transition-colors hover:bg-[#D9786B] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSaving ? "Saving..." : "Save Canvas"}
            </button>
          ) : (
            <span className="border border-neutral-200 bg-neutral-50 px-3 py-1.5 text-xs font-medium text-neutral-600">
              Read Only
            </span>
          )}
        </div>
      </header>

      {/* Canvas area */}
      <main className="relative flex-1 overflow-hidden bg-white">
        <div
          aria-hidden="true"
          className="absolute inset-0 opacity-[0.25] [background-image:linear-gradient(#171716_1px,transparent_1px),linear-gradient(90deg,#171716_1px,transparent_1px)] [background-size:24px_24px]"
        />

        <div className="relative z-10 h-full w-full">
          <CanvasEditor
            key={id}
            ref={canvasRef}
            boardId={id}
            initialElements={
              Array.isArray(board.elements) ? board.elements : []
            }
            initialAppState={
              board.appState && typeof board.appState === "object"
                ? board.appState
                : {}
            }
            userRole={board.userRole || "VIEWER"}
            onCollaborationChange={handleCollaborationChange}
            onSaveStatusChange={({ status, lastSaved, isSaving }) => {
              setSaveStatus(status);
              setIsSaving(isSaving);

              if (lastSaved) {
                setLastSaved(lastSaved);
              }
            }}
          />
        </div>
      </main>

      {/* Share dialog */}
      {isShareOpen && (
        <ShareDialog
          boardId={id}
          userRole={board.userRole || "VIEWER"}
          onClose={() => setIsShareOpen(false)}
        />
      )}
    </div>
  );
}

export default BoardView;
