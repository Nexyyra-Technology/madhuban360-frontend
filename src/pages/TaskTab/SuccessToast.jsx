/**
 * Success Toast Notification (Figma: Success Toast Notification)
 * -------------------------------------------------------------
 * Shows "Success!" with message (e.g. "Updated Successfully"), checkmark icon, close button.
 * Used after create/edit/complete task.
 */
export default function SuccessToast({ title = "Success!", message = "Updated Successfully", onClose }) {
  return (
    <div className="fixed bottom-6 right-6 z-[100] animate-fade-in">
      <div className="bg-white rounded-xl shadow-lg border px-4 py-3 flex items-center gap-4 min-w-[320px]">
        <div className="w-10 h-10 rounded-full bg-green-100 border-2 border-green-300 flex items-center justify-center flex-shrink-0">
          <span className="text-green-600 font-bold">✓</span>
        </div>
        <div className="flex-1">
          <p className="font-semibold text-gray-900">{title}</p>
          <p className="text-sm text-gray-600">{message}</p>
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 p-1"
          aria-label="Close"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
