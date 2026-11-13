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
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpenId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <>
      {isOpenMobile && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-30 bg-neutral-950/20 backdrop-blur-xs md:hidden"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 w-72 transform bg-white p-5 transition-transform duration-200 ease-in-out md:static md:w-64 lg:w-72 md:translate-x-0 border-r border-neutral-200 shrink-0 flex flex-col justify-between ${
          isOpenMobile ? "translate-x-0 shadow-2xl" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-800">
                Workspaces
              </span>
              <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-[10px] font-bold text-neutral-600">
                {workspaces.length}
              </span>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={onOpenCreateWorkspace}
                className="flex h-6 w-6 items-center justify-center rounded-lg bg-[#171716] text-white hover:bg-[#d9786b] text-xs shadow-2xs transition-colors"
                title="Create Workspace"
              >
                +
              </button>

              <button
                type="button"
                onClick={onCloseMobile}
                className="flex h-6 w-6 items-center justify-center rounded-lg text-neutral-400 hover:text-neutral-900 md:hidden"
              >
                ✕
              </button>
            </div>
          </div>

          <div className="space-y-1 overflow-y-auto max-h-[70vh]">
            {isLoading && workspaces.length === 0 ? (
              <div className="space-y-2 py-1">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-10 w-full rounded-xl animate-pulse bg-neutral-100" />
                ))}
              </div>
            ) : workspaces.length === 0 ? (
              <div className="rounded-xl border border-dashed border-neutral-200 bg-neutral-50 p-4 text-center">
                <p className="text-xs text-neutral-500">No workspaces yet</p>
                <button
                  type="button"
                  onClick={onOpenCreateWorkspace}
                  className="mt-1 text-xs font-semibold text-[#d9786b] hover:underline"
                >
                  + Create Workspace
                </button>
              </div>
            ) : (
              workspaces.map((workspace) => {
                const isActive = activeWorkspace?.id === workspace.id;
                const isMenuOpen = menuOpenId === workspace.id;

                return (
                  <div
                    key={workspace.id}
                    className={`group relative flex items-center justify-between rounded-xl border transition-all ${
                      isActive
                        ? "border-neutral-900 bg-neutral-50 text-neutral-950 font-bold shadow-2xs"
                        : "border-transparent text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900"
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => {
                        onSelectWorkspace(workspace);
                        if (onCloseMobile) onCloseMobile();
                      }}
                      className="flex flex-1 items-center gap-2.5 py-2.5 pl-3 pr-1 text-left text-xs"
                    >
                      <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md ${isActive ? "bg-[#171716] text-white" : "bg-neutral-200 text-neutral-700"} text-[10px] font-bold`}>
                        {workspace.name.charAt(0).toUpperCase()}
                      </span>
                      <span className="truncate">{workspace.name}</span>
                    </button>

                    <div className="flex items-center gap-1 pr-2">
                      <span className="rounded-md bg-neutral-200/80 px-1.5 py-0.5 text-[10px] font-mono font-medium text-neutral-700">
                        {workspace._count?.boards || 0}
                      </span>

                      <div className="relative">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setMenuOpenId(isMenuOpen ? null : workspace.id);
                          }}
                          className="flex h-6 w-6 items-center justify-center rounded-md text-neutral-400 hover:text-neutral-900"
                        >
                          ⋯
                        </button>

                        {isMenuOpen && (
                          <div
                            ref={menuRef}
                            className="absolute right-0 top-7 z-40 w-32 rounded-xl border border-neutral-200 bg-white py-1 shadow-lg"
                          >
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setMenuOpenId(null);
                                onOpenRenameWorkspace(workspace);
                              }}
                              className="flex w-full items-center gap-2 px-3 py-1.5 text-xs text-neutral-700 hover:bg-neutral-50"
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
                              className="flex w-full items-center gap-2 px-3 py-1.5 text-xs text-rose-600 hover:bg-rose-50"
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

        <div className="pt-3 border-t border-neutral-100 text-center">
          <p className="text-[11px] text-neutral-400">
            Forma • Collaborative Whiteboard
          </p>
        </div>
      </aside>
    </>
  );
}

export default WorkspaceSidebar;
