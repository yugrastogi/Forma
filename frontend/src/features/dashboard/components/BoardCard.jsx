
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";

function formatRelativeTime(dateString) {
  if (!dateString) return "";

  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);

  if (diffInSeconds < 60) return "Just now";
  if (diffInSeconds < 3600)
    return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400)
    return `${Math.floor(diffInSeconds / 3600)}h ago`;

  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
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

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleClickCard = () => {
    navigate(`/board/${board.id}`);
  };

  return (
    <div
      onClick={handleClickCard}
      className={`group relative flex flex-col justify-between rounded-xl border border-neutral-200 bg-white shadow-2xs transition-all hover:border-neutral-900 hover:shadow-md cursor-pointer ${
        isMenuOpen ? "z-50" : "z-0"
      }`}
    >
      {/* Board preview */}
      <div className="relative h-32 w-full rounded-t-xl border-b border-neutral-100 bg-[#fbfbfa] p-4">
        <div
          aria-hidden="true"
          className="absolute inset-0 rounded-t-xl opacity-40 [background-image:radial-gradient(#171716_1px,transparent_1px)] [background-size:16px_16px]"
        />

        <div className="pointer-events-none relative flex h-full flex-col justify-end">
          <span className="self-start font-mono text-[10px] text-neutral-400">
            Whiteboard
          </span>
        </div>

        {/* Favorite button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite(board);
          }}
          title={board.isFavorite ? "Remove favorite" : "Add favorite"}
          className={`absolute right-2.5 top-2.5 flex h-7 w-7 items-center justify-center rounded-full border shadow-2xs transition-all ${
            board.isFavorite
              ? "border-amber-400 bg-amber-400 text-white"
              : "border-neutral-200 bg-white text-neutral-400 hover:border-[#D9786B] hover:text-[#D9786B]"
          }`}
        >
          ★
        </button>
      </div>

      {/* Board details */}
      <div className="flex items-start justify-between p-3.5">
        <div className="min-w-0 flex-1 pr-2">
          <h3 className="truncate text-sm font-bold text-neutral-900 transition-colors group-hover:text-[#D9786B]">
            {board.title}
          </h3>

          {board.description ? (
            <p className="mt-1 line-clamp-1 text-xs text-neutral-500">
              {board.description}
            </p>
          ) : (
            <p className="mt-1 text-[11px] italic text-neutral-400">
              No description
            </p>
          )}

          <div className="mt-2.5 flex items-center gap-2 text-[11px] text-neutral-400">
            <span>{formatRelativeTime(board.updatedAt)}</span>

            {board.workspace?.name && (
              <>
                <span>•</span>
                <span className="max-w-[120px] truncate font-medium text-neutral-600">
                  {board.workspace.name}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Board options */}
        {board.role && board.role !== "OWNER" ? (
          <span className="rounded bg-neutral-100 px-1.5 py-0.5 text-[10px] font-medium text-neutral-600">
            {board.role}
          </span>
        ) : (
          <div
            ref={menuRef}
            className={`relative shrink-0 ${isMenuOpen ? "z-50" : ""}`}
          >
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsMenuOpen((prev) => !prev);
              }}
              aria-label="Board options"
              aria-expanded={isMenuOpen}
              className={`flex h-7 w-7 items-center justify-center rounded-md transition-colors ${
                isMenuOpen
                  ? "bg-[#D9786B]/10 text-[#D9786B]"
                  : "text-neutral-400 hover:bg-neutral-100 hover:text-neutral-900"
              }`}
            >
              <svg
                className="h-5 w-5"
                viewBox="0 0 24 24"
                fill="currentColor"
                aria-hidden="true"
              >
                <circle cx="5" cy="12" r="1.7" />
                <circle cx="12" cy="12" r="1.7" />
                <circle cx="19" cy="12" r="1.7" />
              </svg>
            </button>

            {/* Board dropdown */}
            {isMenuOpen && (
              <div
                onClick={(e) => e.stopPropagation()}
                className="absolute right-0 top-full z-[100] mt-1 w-36 border border-neutral-200 bg-white py-1 shadow-xl"
              >
                <button
                  type="button"
                  onClick={() => {
                    setIsMenuOpen(false);
                    onOpenRenameBoard(board);
                  }}
                  className="w-full px-3 py-2 text-left text-xs !font-bold text-neutral-700 transition-colors hover:bg-[#D9786B]/10 hover:text-[#D9786B]"
                >
                  Rename
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsMenuOpen(false);
                    onOpenDeleteBoard(board);
                  }}
                  className="w-full px-3 py-2 text-left text-xs !font-bold text-red-600 transition-colors hover:bg-red-50"
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
