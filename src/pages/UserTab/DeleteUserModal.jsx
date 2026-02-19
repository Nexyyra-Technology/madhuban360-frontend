import { useState } from "react";
import { deleteUser } from "./userService";
import ModalWrapper from "./ModalWrapper";

export default function DeleteUserModal({ userId, userName, userEmail, onClose, onSuccess }) {
  const [step, setStep] = useState(1);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  async function handleConfirm() {
    setError("");
    try {
      setDeleting(true);
      await deleteUser(userId);
      onSuccess?.();
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
        {step === 1 ? (
          <>
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                <span className="material-symbols-outlined text-2xl text-amber-600">help</span>
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Delete User</h2>
                <p className="text-sm text-gray-600 mt-1">
                  Do you want to delete <span className="font-medium">{userName || "this user"}</span>?
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
                  <p className="text-xs text-gray-500">{userEmail || ""}</p>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button onClick={onClose} className="px-4 py-2 border rounded-lg text-gray-700 font-medium">
                Cancel
              </button>
              <button
                onClick={() => setStep(2)}
                className="px-4 py-2 bg-[#1f2a44] text-white rounded-lg font-medium hover:opacity-90"
              >
                Continue
              </button>
            </div>
          </>
        ) : (
          <>
            <p className="text-gray-700">Are you sure you want to delete that user?</p>

            {error ? <p className="text-sm text-red-600">{error}</p> : null}

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setStep(1)}
                disabled={deleting}
                className="px-4 py-2 border rounded-lg text-gray-700 font-medium disabled:opacity-60"
              >
                Back
              </button>
              <button
                onClick={handleConfirm}
                disabled={deleting}
                className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 disabled:opacity-60"
              >
                {deleting ? "Processing..." : "Confirm Delete"}
              </button>
            </div>
          </>
        )}
      </div>
    </ModalWrapper>
  );
}
