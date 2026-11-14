import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";

function formatRelativeTime(dateString) {
  if (!dateString) return "";
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);

  if (diffInSeconds < 60) return "Just now";
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function BoardCard({
  board,
  onToggleFavorite,
  onOpenRenameBoard,
  onOpenDeleteBoard,
}) {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleClickCard = () => {
    navigate(`/board/${board.id}`);
  };

  return (
    <div
      onClick={handleClickCard}
      className="group relative flex flex-col justify-between rounded-xl border border-neutral-200 bg-white shadow-2xs hover:border-neutral-900 hover:shadow-md transition-all cursor-pointer overflow-hidden"
    >
      <div className="relative h-32 w-full border-b border-neutral-100 bg-[#fbfbfa] p-4">
        <div
          aria-hidden="true"
          className="absolute inset-0 opacity-40 [background-image:radial-gradient(#171716_1px,transparent_1px)] [background-size:16px_16px]"
        />

        <div className="relative flex h-full flex-col justify-between pointer-events-none">
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-8 rounded-full bg-neutral-300" />
            <span className="h-2 w-12 rounded-full bg-[#e77b6d]" />
          </div>
          <span className="self-start text-[10px] font-mono text-neutral-400">
            Whiteboard
          </span>
        </div>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite(board);
          }}
          title={board.isFavorite ? "Remove favorite" : "Add favorite"}
          className={`absolute top-2.5 right-2.5 flex h-7 w-7 items-center justify-center rounded-full border shadow-2xs transition-all ${
            board.isFavorite
              ? "border-amber-400 bg-amber-400 text-white"
              : "border-neutral-200 bg-white text-neutral-400 hover:border-neutral-900 hover:text-neutral-900"
          }`}
        >
          ★
        </button>
      </div>

      <div className="flex items-start justify-between p-3.5">
        <div className="min-w-0 flex-1 pr-2">
          <h3 className="truncate text-sm font-bold text-neutral-900 group-hover:text-[#d9786b] transition-colors">
            {board.title}
          </h3>
          {board.description ? (
            <p className="mt-1 line-clamp-1 text-xs text-neutral-500">
              {board.description}
            </p>
          ) : (
            <p className="mt-1 text-[11px] text-neutral-400 italic">No description</p>
          )}

          <div className="mt-2.5 flex items-center gap-2 text-[11px] text-neutral-400">
            <span>{formatRelativeTime(board.updatedAt)}</span>
            {board.workspace?.name && (
              <>
                <span>•</span>
                <span className="truncate max-w-[120px] text-neutral-600 font-medium">
                  {board.workspace.name}
                </span>
              </>
            )}
          </div>
        </div>

        {board.role && board.role !== "OWNER" ? (
          <span className="px-1.5 py-0.5 text-[10px] font-medium rounded bg-neutral-100 text-neutral-600">
            {board.role}
          </span>
        ) : (
          <div className="relative">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsMenuOpen(!isMenuOpen);
              }}
              className="flex h-7 w-7 items-center justify-center rounded-lg text-neutral-400 hover:bg-neutral-100 hover:text-neutral-900"
            >
              ⋯
            </button>

            {isMenuOpen && (
              <div
                ref={menuRef}
                onClick={(e) => e.stopPropagation()}
                className="absolute right-0 top-8 z-40 w-32 rounded-xl border border-neutral-200 bg-white py-1 shadow-lg"
              >
                <button
                  type="button"
                  onClick={() => {
                    setIsMenuOpen(false);
                    onOpenRenameBoard(board);
                  }}
                  className="flex w-full items-center gap-2 px-3 py-1.5 text-xs text-neutral-700 hover:bg-neutral-50"
                >
                  Rename
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsMenuOpen(false);
                    onOpenDeleteBoard(board);
                  }}
                  className="flex w-full items-center gap-2 px-3 py-1.5 text-xs text-rose-600 hover:bg-rose-50"
                >
                  Delete
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default BoardCard;
