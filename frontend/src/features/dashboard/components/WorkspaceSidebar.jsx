
import { useState, useRef, useEffect } from "react";

function WorkspaceSidebar({
  workspaces,
  activeWorkspace,
  onSelectWorkspace,
  onOpenCreateWorkspace,
  onOpenRenameWorkspace,
  onOpenDeleteWorkspace,
  isLoading,
  isOpenMobile,
  onCloseMobile,
}) {
  const [menuOpenId, setMenuOpenId] = useState(null);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target)
      ) {
        setMenuOpenId(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <>
      {isOpenMobile && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-30 bg-neutral-950/20 md:hidden"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-72 shrink-0 flex-col justify-between border-r border-neutral-200 bg-white p-5 transition-transform duration-200 md:static md:w-64 md:translate-x-0 lg:w-72 ${
          isOpenMobile
            ? "translate-x-0 shadow-2xl"
            : "-translate-x-full md:translate-x-0"
        }`}
      >
        <div className="space-y-5">

          {/* Workspace heading */}
          <div className="flex items-center justify-between border-b border-neutral-100 pb-4">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-800">
                Workspaces
              </span>

              <span className="bg-neutral-100 px-2 py-0.5 text-[10px] font-bold text-neutral-600">
                {workspaces.length}
              </span>
            </div>

            <button
              type="button"
              onClick={onCloseMobile}
              className="flex h-7 w-7 items-center justify-center text-neutral-400 hover:text-[#D9786B] md:hidden"
            >
              ✕
            </button>
          </div>

          {/* Dedicated Create Workspace button */}
          <button
            type="button"
            onClick={onOpenCreateWorkspace}
            className="flex w-full items-center justify-center gap-2 border border-neutral-200 bg-white px-3 py-2.5 text-xs font-semibold text-neutral-800 transition-colors hover:border-[#D9786B] hover:text-[#D9786B]"
          >
            <span className="text-base leading-none">+</span>
            New Workspace
          </button>

          {/* Workspace list */}
          <div className="space-y-1 overflow-visible">
            {isLoading && workspaces.length === 0 ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-10 w-full animate-pulse bg-neutral-100"
                  />
                ))}
              </div>
            ) : workspaces.length === 0 ? (
              <p className="px-2 py-4 text-center text-xs text-neutral-400">
                No workspaces yet
              </p>
            ) : (
              workspaces.map((workspace) => {
                const isActive =
                  activeWorkspace?.id === workspace.id;

                const isMenuOpen = menuOpenId === workspace.id;

                return (
                  <div
                    key={workspace.id}
                    className={`relative flex items-center justify-between border transition-colors ${
                      isActive
                        ? "z-20 border-[#D9786B]/40 bg-[#D9786B]/5 font-bold text-neutral-950"
                        : "border-transparent text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900"
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => {
                        onSelectWorkspace(workspace);
                        onCloseMobile?.();
                      }}
                      className="flex min-w-0 flex-1 items-center gap-2.5 py-2.5 pl-3 pr-1 text-left text-xs"
                    >
                      <span
                        className={`flex h-5 w-5 shrink-0 items-center justify-center text-[10px] font-bold ${
                          isActive
                            ? "bg-[#D9786B] text-white"
                            : "bg-neutral-200 text-neutral-700"
                        }`}
                      >
                        {workspace.name.charAt(0).toUpperCase()}
                      </span>

                      <span className="truncate">
                        {workspace.name}
                      </span>
                    </button>

                    <div className="flex shrink-0 items-center gap-1 pr-2">
                      <span className="bg-neutral-200/80 px-1.5 py-0.5 text-[10px] font-mono font-medium text-neutral-700">
                        {workspace._count?.boards || 0}
                      </span>

                      <div
                        className="relative"
                        ref={isMenuOpen ? menuRef : null}
                      >
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setMenuOpenId(
                              isMenuOpen ? null : workspace.id
                            );
                          }}
                          className="flex h-7 w-7 items-center justify-center text-neutral-400 transition-colors hover:bg-[#D9786B]/10 hover:text-[#D9786B]"
                          aria-label="Workspace options"
                        >
                          ⋯
                        </button>

                        {isMenuOpen && (
                          <div className="absolute right-0 top-full z-[100] mt-1 w-36 border border-neutral-200 bg-white py-1 shadow-xl">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setMenuOpenId(null);
                                onOpenRenameWorkspace(workspace);
                              }}
                              className="w-full px-3 py-2 text-left text-xs text-neutral-700 transition-colors hover:bg-[#D9786B]/10 hover:text-[#D9786B]"
                            >
                              Rename
                            </button>

                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setMenuOpenId(null);
                                onOpenDeleteWorkspace(workspace);
                              }}
                              className="w-full px-3 py-2 text-left text-xs text-red-600 hover:bg-red-50"
                            >
                              Delete
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-neutral-100 pt-3 text-center">
          <p className="text-[11px] text-neutral-400">
            Forma <span className="text-[#D9786B]">·</span> Collaborative Whiteboard
          </p>
        </div>
      </aside>
    </>
  );
}

export default WorkspaceSidebar;
