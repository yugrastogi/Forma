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

function RecentBoards({ recentBoards }) {
  const navigate = useNavigate();

  if (!recentBoards || recentBoards.length === 0) {
    return null;
  }

  return (
    <div className="mb-7">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="flex h-5 w-5 items-center justify-center rounded-md bg-indigo-600 text-white shadow-2xs text-[10px]">
            ⏱
          </span>
          <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-800">
            Recently Opened
          </h2>
        </div>
        <span className="text-xs text-neutral-500 font-medium">
          Quick Access
        </span>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-2 sm:grid sm:grid-cols-3 lg:grid-cols-6 sm:overflow-visible sm:pb-0">
        {recentBoards.map((board) => (
          <button
            key={board.id}
            type="button"
            onClick={() => navigate(`/board/${board.id}`)}
            className="group flex min-w-[155px] sm:min-w-0 flex-col justify-between rounded-xl border border-neutral-200 bg-white p-3 text-left shadow-2xs hover:border-neutral-900 hover:shadow-md transition-all cursor-pointer"
          >
            <div className="w-full">
              <div className="flex items-center justify-between">
                <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-[#171716] text-[10px] font-bold text-white shadow-2xs group-hover:bg-indigo-600 transition-colors">
                  □
                </span>
                {board.isFavorite && (
                  <span className="text-amber-500 text-xs">★</span>
                )}
              </div>
              <h4 className="mt-2.5 truncate text-xs font-bold text-neutral-950 group-hover:text-indigo-600 transition-colors">
                {board.title}
              </h4>
            </div>

            <div className="mt-3 flex items-center justify-between text-[10px] text-neutral-400">
              <span className="truncate max-w-[75px] font-semibold text-neutral-600">
                {board.workspace?.name || "Workspace"}
              </span>
              <span>{formatRelativeTime(board.updatedAt)}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

export default RecentBoards;
