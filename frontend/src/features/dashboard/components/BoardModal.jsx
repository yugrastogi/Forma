import { useState } from "react";

function BoardModalDialog({
  onClose,
  onSubmit,
  initialData = { title: "", description: "" },
  workspaceName = "",
  isEdit = false,
}) {
  const [title, setTitle] = useState(initialData.title || "");
  const [description, setDescription] = useState(initialData.description || "");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setError("Board title is required");
      return;
    }
    setError("");
    setIsSubmitting(true);
    try {
      await onSubmit({
        title: title.trim(),
        description: description.trim() || null,
      });
      onClose();
    } catch (err) {
      setError(err.message || "Failed to save board");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-950/40 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-2xl border border-neutral-200/90 bg-white p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between border-b border-neutral-200/80 pb-3.5">
          <div className="flex items-center gap-2.5">
            <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-[#171716] text-white text-xs font-bold shadow-2xs">
              □
            </span>
            <div>
              <h2 className="text-base font-bold text-neutral-900">
                {isEdit ? "Edit Board" : "Create New Board"}
              </h2>
              {workspaceName && !isEdit && (
                <p className="mt-0.5 text-xs text-neutral-500">
                  Inside <span className="font-semibold text-neutral-800">{workspaceName}</span>
                </p>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-neutral-400 hover:bg-neutral-100 hover:text-neutral-900 transition-colors"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label htmlFor="board-title" className="block text-xs font-semibold text-neutral-700 mb-1.5">
              Board Title
            </label>
            <input
              id="board-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Architecture Flowchart, User Journey..."
              maxLength={100}
              autoFocus
              className="w-full rounded-xl border border-neutral-200 bg-[#fbfbfa] px-3.5 py-2.5 text-sm text-neutral-900 shadow-2xs outline-none transition-all focus:border-neutral-900 focus:bg-white focus:ring-1 focus:ring-neutral-900/10"
            />
          </div>

          <div>
            <label htmlFor="board-desc" className="block text-xs font-semibold text-neutral-700 mb-1.5">
              Description <span className="text-neutral-400 font-normal">(optional)</span>
            </label>
            <textarea
              id="board-desc"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Context or goals for this whiteboard..."
              maxLength={300}
              className="w-full rounded-xl border border-neutral-200 bg-[#fbfbfa] px-3.5 py-2 text-sm text-neutral-900 shadow-2xs outline-none transition-all focus:border-neutral-900 focus:bg-white focus:ring-1 focus:ring-neutral-900/10 resize-none"
            />
          </div>

          {error && (
            <p className="rounded-lg border-l-3 border-[#d9786b] bg-[#d9786b]/10 px-3 py-2 text-xs text-red-800 font-medium">
              {error}
            </p>
          )}

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-neutral-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="rounded-xl border border-neutral-200 px-4 py-2 text-xs font-semibold text-neutral-700 shadow-2xs hover:bg-neutral-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-xl bg-[#171716] px-4 py-2 text-xs font-semibold text-white shadow-xs transition-all hover:bg-[#d9786b] hover:shadow-md disabled:opacity-60 cursor-pointer"
            >
              {isSubmitting ? "Saving..." : isEdit ? "Save Changes" : "Create Board"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function BoardModal(props) {
  if (!props.isOpen) return null;
  const key = `${props.isOpen}_${props.initialData?.title || ""}`;
  return <BoardModalDialog key={key} {...props} />;
}

export default BoardModal;
