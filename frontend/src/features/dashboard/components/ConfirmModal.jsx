
function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title = "Confirm Deletion",
  message = "Are you sure you want to delete this item? This action cannot be undone.",
  confirmLabel = "Delete",
  isDanger = true,
}) {
  if (!isOpen) return null;

  const handleConfirm = async () => {
    await onConfirm();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-950/40 p-4">
      <div className="w-full max-w-sm border border-neutral-200 bg-white p-6 shadow-2xl">

        <div>
          <h3 className="text-base font-bold text-neutral-900">
            {title}
          </h3>

          <p className="mt-2 text-sm leading-relaxed text-neutral-500">
            {message}
          </p>
        </div>

        <div className="mt-6 flex justify-end gap-2 border-t border-neutral-100 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="h-9 border border-neutral-200 bg-white px-4 text-xs font-semibold text-neutral-700 transition-colors hover:border-neutral-900 hover:bg-neutral-50"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleConfirm}
            className="h-9 bg-[#171716] px-4 text-xs font-semibold text-white transition-colors hover:bg-neutral-700"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmModal;
