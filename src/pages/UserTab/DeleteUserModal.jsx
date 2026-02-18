import { useState } from "react";
import { deleteUser } from "./userService";
import ModalWrapper from "./ModalWrapper";

export default function DeleteUserModal({ userId, userName, userEmail, onClose, onSuccess }) {
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");
  const [step, setStep] = useState(1);

  async function handleDelete() {
    setError("");
    try {
      setDeleting(true);
      await deleteUser(userId);
      onSuccess?.(userId);
      onClose?.();
    } catch (e) {
      setError(e?.message || "Failed to delete user");
    } finally {
      setDeleting(false);
    }
  }

  const initials = userName
    ?.split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase() || "?";

  return (
    <ModalWrapper widthClass="w-[520px]">
      <div className="space-y-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4v2m0 4v2M7.828 3H16.17C17.338 3 18 3.673 18 4.972V19.028C18 20.323 17.338 21 16.17 21H7.828C6.662 21 6 20.327 6 19.028V4.972C6 3.677 6.662 3 7.828 3z" />
            </svg>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Delete User</h2>
            <p className="text-sm text-gray-600 mt-1">
              Are you sure you want to delete <span className="font-medium">{userName || "this user"}</span>? This action cannot be undone. All associated data, activity logs, and permissions will be permanently removed from the database.
            </p>
          </div>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-semibold text-blue-600">
              {initials}
            </div>
            <div>
              <p className="font-semibold text-gray-900">{userName || "User"}</p>
              <p className="text-xs text-gray-500">{userEmail || ""} • ID: USR-9921</p>
            </div>
          </div>
        </div>

        {error ? <p className="text-sm text-red-600">{error}</p> : null}

        <div className="flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 border rounded-lg text-gray-700 font-medium">
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium disabled:opacity-60"
          >
            {deleting ? "Deleting..." : "Delete User"}
          </button>
        </div>
      </div>
    </ModalWrapper>
  );
}
