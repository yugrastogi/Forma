
import { useState } from "react";

function WorkspaceModalDialog({
  onClose,
  onSubmit,
  initialValue = "",
  isEdit = false,
}) {
  const [name, setName] = useState(initialValue);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name.trim()) {
      setError("Workspace name is required");
      return;
    }

    setError("");
    setIsSubmitting(true);

    try {
      await onSubmit(name.trim());
      onClose();
    } catch (err) {
      setError(err.message || "Failed to save workspace");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-950/40 p-4">
      <div className="w-full max-w-md border border-neutral-200 bg-white p-6 shadow-2xl">

        <div className="flex items-center justify-between border-b border-neutral-200 pb-4">
          <h2 className="text-base font-bold text-neutral-900">
            {isEdit ? "Rename Workspace" : "Create New Workspace"}
          </h2>

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
              htmlFor="workspace-name"
              className="mb-2 block text-xs font-semibold text-neutral-700"
            >
              Workspace Name
            </label>

            <input
              id="workspace-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Design Systems, Sprint 23"
              maxLength={60}
              autoFocus
              className="w-full border border-neutral-200 bg-[#f7f6f2] px-3.5 py-2.5 text-sm text-neutral-900 outline-none transition-colors focus:border-neutral-900 focus:bg-white"
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
                : "Create Workspace"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function WorkspaceModal(props) {
  if (!props.isOpen) return null;

  return (
    <WorkspaceModalDialog
      key={`${props.isOpen}_${props.initialValue}`}
      {...props}
    />
  );
}

export default WorkspaceModal;
