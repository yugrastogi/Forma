import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { boardService } from "../../services/boardService";
import CanvasEditor from "../canvas/CanvasEditor";

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
  useEffect(() => {
    let isMounted = true;
    const fetchCanvas = async () => {
      try {
        const data = await boardService.getBoardCanvas(id);
        if (!isMounted) return;
        setBoard(data);
        setTitleInput(data.title);
        setLastSaved(data.updatedAt ? new Date(data.updatedAt) : new Date());
      } catch (err) {
        if (!isMounted) return;
        setError(err.response?.data?.message || "Failed to load board");
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

  const handleSaveTitle = async () => {
    if (!titleInput.trim() || titleInput === board?.title) {
      setIsEditingTitle(false);
      return;
    }

    try {
      const result = await boardService.updateBoard(id, { title: titleInput.trim() });
      setBoard((prev) => ({ ...prev, title: result.board.title }));
      setIsEditingTitle(false);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to rename board");
    }
  };

  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f7f6f2]">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#171716] text-sm font-bold text-white shadow-md">
            f.
          </span>
          <span className="text-sm tracking-wide text-neutral-600 font-medium">
            Loading Board...
          </span>
        </div>
      </main>
    );
  }

  if (error || !board) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-[#f7f6f2] p-6 text-center">
        <div className="rounded-2xl border border-neutral-200 bg-white p-8 shadow-md max-w-md w-full">
          <h2 className="text-base font-bold text-neutral-900">
            {error || "Board Not Found"}
          </h2>
          <p className="mt-1 text-xs text-neutral-500 leading-relaxed">
            The requested board does not exist or you do not have permission to view it.
          </p>
          <button
            type="button"
            onClick={() => navigate("/")}
            className="mt-5 rounded-xl bg-[#171716] px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-[#d9786b]"
          >
            Return to Dashboard
          </button>
        </div>
      </main>
    );
  }

  return (
    <div className="flex h-screen flex-col bg-[#f7f6f2] text-[#171716]">
      <header className="z-20 flex h-14 shrink-0 items-center justify-between border-b border-neutral-200 bg-white px-4 shadow-2xs">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <Link
            to="/"
            className="flex items-center gap-1.5 text-xs font-semibold text-neutral-600 hover:text-neutral-950 shrink-0"
            title="Back to Dashboard"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-neutral-200 bg-[#f7f6f2] text-xs shadow-2xs hover:border-neutral-900 transition-all">
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

          {isEditingTitle ? (
            <div className="flex items-center gap-1">
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
                className="rounded-md border border-neutral-900 px-2 py-0.5 text-xs sm:text-sm font-bold text-neutral-950 outline-none"
              />
              <button
                type="button"
                onClick={handleSaveTitle}
                className="rounded-md bg-[#171716] px-2 py-0.5 text-xs text-white"
              >
                Save
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setIsEditingTitle(true)}
              className="flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs sm:text-sm font-bold text-neutral-950 hover:bg-neutral-100 transition-colors truncate"
              title="Click to rename board"
            >
              <span className="truncate">{board.title}</span>
              <span className="text-xs text-neutral-400">✎</span>
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <div className="hidden items-center gap-1.5 text-[11px] text-neutral-500 font-medium sm:flex">
              <span
                className={`h-2 w-2 rounded-full ${
                  saveStatus === "saved"
                    ? "bg-emerald-500"
                    : saveStatus === "saving"
                    ? "bg-blue-500"
                    : saveStatus === "error"
                    ? "bg-red-500"
                    : "bg-amber-500"
                }`}
              />

              <span>
                {saveStatus === "saving"
                  ? "Saving..."
                  : saveStatus === "unsaved"
                  ? "Unsaved changes"
                  : saveStatus === "error"
                  ? "Save failed"
                  : `Saved ${
                      lastSaved
                        ? lastSaved.toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : ""
                    }`}
              </span>
            </div>

          <button
            type="button"
            onClick={() => canvasRef.current?.saveCanvas()}
            disabled={isSaving}
            className="flex items-center gap-1.5 rounded-lg bg-[#171716] px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-[#d9786b] disabled:opacity-60 cursor-pointer"
          >
            {isSaving ? "Saving..." : "Save Canvas"}
          </button>
        </div>
      </header>

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
            initialElements={Array.isArray(board.elements) ? board.elements : []}
            initialAppState={
              board.appState && typeof board.appState === "object"
                ? board.appState
                : {}
            }
            onSaveStatusChange={({ status, lastSaved, isSaving }) => {
              setSaveStatus(status);
              setIsSaving(isSaving);
              if (lastSaved) setLastSaved(lastSaved);
            }}
          />
        </div>
      </main>
    </div>
  );
}

export default BoardView;
