import { useState } from "react";
import { deleteUser } from "./userService";
import ModalWrapper from "./ModalWrapper";

export default function DeleteUserModal({ userId, onClose, onSuccess }) {
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

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

  return (
    <ModalWrapper widthClass="w-[450px]">
      <h2 className="text-lg font-semibold text-red-600 mb-4">
        Delete User
      </h2>

      <p className="text-sm text-gray-600 mb-6">
        Are you sure you want to delete this user?
      </p>

      {error ? (
        <p className="text-sm text-red-600 mb-4">{error}</p>
      ) : null}

      <div className="flex justify-end gap-3">
        <button onClick={onClose} className="px-4 py-2 border rounded-lg">
          Cancel
        </button>
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="px-4 py-2 bg-red-600 text-white rounded-lg disabled:opacity-60"
        >
          {deleting ? "Deleting..." : "Delete User"}
        </button>
      </div>
    </ModalWrapper>
  );
}
