import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../../stores/authStore";

function Navbar({
  onOpenCreateWorkspace,
  onOpenCreateBoard,
  searchQuery,
  onSearchChange,
  isMobileSidebarOpen,
  onToggleMobileSidebar,
  activeWorkspaceName,
}) {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      navigate("/login", { replace: true });
    } finally {
      setIsLoggingOut(false);
    }
  };

  const userInitial = user?.name ? user.name.trim().charAt(0).toUpperCase() : "U";

  return (
    <header className="sticky top-0 z-30 border-b border-neutral-200 bg-white/95 backdrop-blur-md">
      <div className="flex h-16 w-full items-center justify-between px-4 sm:px-6 lg:px-8 gap-3">
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={onToggleMobileSidebar}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-neutral-200 bg-white text-neutral-700 shadow-2xs hover:border-neutral-900 md:hidden"
            title="Toggle Menu"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {isMobileSidebarOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>

          <Link
            to="/"
            className="flex items-center gap-2 text-lg sm:text-xl font-bold tracking-tight text-[#171716]"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#171716] text-xs font-black text-white shadow-xs">
              f.
            </span>
            <span className="hidden xs:inline">forma</span>
          </Link>

          {activeWorkspaceName && (
            <div className="hidden sm:flex items-center gap-1.5 rounded-full border border-indigo-200 bg-indigo-50/70 px-3 py-1 text-xs text-indigo-700 font-medium">
              <span className="h-1.5 w-1.5 rounded-full bg-indigo-600" />
              <span className="max-w-[140px] truncate">{activeWorkspaceName}</span>
            </div>
          )}
        </div>

        <div className="flex flex-1 max-w-sm sm:max-w-md mx-2">
          <div className="relative w-full">
            <div className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-neutral-400">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search boards..."
              className="w-full rounded-xl border border-neutral-200 bg-[#f7f6f2]/80 py-1.5 pl-9 pr-7 text-xs sm:text-sm text-neutral-900 outline-none transition-all placeholder:text-neutral-400 focus:bg-white focus:border-neutral-900"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => onSearchChange("")}
                className="absolute inset-y-0 right-2.5 flex items-center text-xs text-neutral-400 hover:text-neutral-900"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={onOpenCreateWorkspace}
            className="hidden items-center gap-1.5 rounded-xl border border-neutral-200 bg-white px-3 py-1.5 text-xs font-semibold text-neutral-800 shadow-2xs hover:border-neutral-900 lg:flex"
          >
            <span>+ Workspace</span>
          </button>

          <button
            type="button"
            onClick={onOpenCreateBoard}
            className="flex items-center gap-1.5 rounded-xl bg-[#171716] px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-[#d9786b] transition-all"
          >
            <span>+ New Board</span>
          </button>

          <div className="flex items-center gap-2 border-l border-neutral-200 pl-2 sm:pl-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-tr from-neutral-900 to-indigo-600 text-xs font-bold text-white shadow-xs">
              {userInitial}
            </div>
            <div className="hidden flex-col text-left text-xs lg:flex">
              <span className="max-w-[100px] truncate font-bold text-neutral-900 leading-tight">
                {user?.name || "User"}
              </span>
              <span className="max-w-[100px] truncate text-[10px] text-neutral-500">
                {user?.email}
              </span>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="flex h-8 items-center rounded-xl border border-neutral-200 bg-white px-2.5 text-xs font-medium text-neutral-700 shadow-2xs hover:border-neutral-900 hover:bg-neutral-50 disabled:opacity-50"
            >
              {isLoggingOut ? "..." : "Logout"}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Navbar;
