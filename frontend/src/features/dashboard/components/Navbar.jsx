
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../../stores/authStore";

function Navbar({
  searchQuery,
  onSearchChange,
  isMobileSidebarOpen,
  onToggleMobileSidebar,
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

  const userInitial = user?.name
    ? user.name.trim().charAt(0).toUpperCase()
    : "U";

  return (
    <header className="sticky top-0 z-30 border-b border-neutral-200 bg-white">
      <div className="flex h-16 w-full items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">

        {/* Brand */}
        <div className="flex shrink-0 items-center gap-3">
          <button
            type="button"
            onClick={onToggleMobileSidebar}
            className="flex h-9 w-9 items-center justify-center border border-neutral-200 bg-white text-neutral-700 transition-colors hover:border-[#D9786B] hover:text-[#D9786B] md:hidden"
            title="Toggle Menu"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              {isMobileSidebarOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>

          <Link
            to="/"
            className="flex items-center gap-2 text-xl font-bold tracking-tight text-[#171716]"
          >
            <span className="flex h-8 w-8 items-center justify-center bg-[#171716] text-xs font-black text-white">
              f.
            </span>
            <span className="hidden xs:inline">forma</span>
          </Link>
        </div>

        {/* Search */}
        <div className="mx-2 flex max-w-md flex-1">
          <div className="relative w-full">
            <div className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-neutral-400">
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>

            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search boards..."
              className="w-full border border-neutral-200 bg-[#f7f6f2] py-2 pl-9 pr-8 text-sm text-neutral-900 outline-none transition-colors placeholder:text-neutral-400 focus:border-[#D9786B] focus:bg-white"
            />

            {searchQuery && (
              <button
                type="button"
                onClick={() => onSearchChange("")}
                className="absolute inset-y-0 right-3 text-xs text-neutral-400 hover:text-[#D9786B]"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* User */}
        <div className="flex shrink-0 items-center gap-3 border-l border-neutral-200 pl-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#D9786B] text-xs font-bold text-white">
            {userInitial}
          </div>

          <span className="hidden max-w-[120px] truncate text-xs font-semibold text-neutral-900 sm:block">
            {user?.name || "User"}
          </span>

          <button
            type="button"
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="flex h-8 items-center border border-neutral-200 bg-white px-3 text-xs font-medium text-neutral-700 transition-colors hover:border-[#D9786B] hover:text-[#D9786B] disabled:opacity-50"
          >
            {isLoggingOut ? "..." : "Logout"}
          </button>
        </div>
      </div>
    </header>
  );
}

export default Navbar;
