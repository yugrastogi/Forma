
import { useState } from "react";

function BoardModalDialog({
  onClose,
  onSubmit,
  initialData = { title: "", description: "" },
  workspaceName = "",
  isEdit = false,
}) {
  const [title, setTitle] = useState(initialData.title || "");
  const [description, setDescription] = useState(
    initialData.description || ""
  );
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-950/40 p-4">
      <div className="w-full max-w-md border border-neutral-200 bg-white p-6 shadow-2xl">

        <div className="flex items-center justify-between border-b border-neutral-200 pb-4">
          <div>
            <h2 className="text-base font-bold text-neutral-900">
              {isEdit ? "Edit Board" : "Create New Board"}
            </h2>

            {workspaceName && !isEdit && (
              <p className="mt-1 text-xs text-neutral-500">
                Inside{" "}
                <span className="font-semibold text-neutral-800">
                  {workspaceName}
                </span>
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center text-neutral-400 hover:bg-neutral-100 hover:text-neutral-900"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-5">
          <div>
            <label
              htmlFor="board-title"
              className="mb-2 block text-xs font-semibold text-neutral-700"
            >
              Board Title
            </label>

            <input
              id="board-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Architecture Flowchart"
              maxLength={100}
              autoFocus
              className="w-full border border-neutral-200 bg-[#f7f6f2] px-3.5 py-2.5 text-sm text-neutral-900 outline-none transition-colors focus:border-neutral-900 focus:bg-white"
            />
          </div>

          <div>
            <label
              htmlFor="board-desc"
              className="mb-2 block text-xs font-semibold text-neutral-700"
            >
              Description{" "}
              <span className="font-normal text-neutral-400">
                (optional)
              </span>
            </label>

            <textarea
              id="board-desc"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Context or goals for this whiteboard..."
              maxLength={300}
              className="w-full resize-none border border-neutral-200 bg-[#f7f6f2] px-3.5 py-2.5 text-sm text-neutral-900 outline-none transition-colors focus:border-neutral-900 focus:bg-white"
            />
          </div>

          {error && (
            <p className="border-l-2 border-red-500 bg-red-50 px-3 py-2 text-xs text-red-700">
              {error}
            </p>
          )}

          <div className="flex justify-end gap-2 border-t border-neutral-100 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="h-9 border border-neutral-200 bg-white px-4 text-xs font-semibold text-neutral-700 transition-colors hover:border-neutral-900 hover:bg-neutral-50 disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="h-9 bg-[#171716] px-4 text-xs font-semibold text-white transition-colors hover:bg-neutral-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting
                ? "Saving..."
                : isEdit
                ? "Save Changes"
                : "Create Board"}
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
