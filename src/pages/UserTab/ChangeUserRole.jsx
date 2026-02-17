import ModalWrapper from "./ModalWrapper";

export default function ChangeUserRole({ onClose }) {
  const handleClose = onClose ?? (() => window.history.back());

  return (
    <ModalWrapper>
      <h2 className="text-lg font-semibold mb-6">Change User Role</h2>

      <div className="space-y-4">
        <label className="flex items-center gap-3 border p-4 rounded-lg cursor-pointer">
          <input type="radio" name="role" />
          <div>
            <p className="font-medium">Admin</p>
            <p className="text-xs text-gray-500">Manage all users</p>
          </div>
        </label>

        <label className="flex items-center gap-3 border p-4 rounded-lg cursor-pointer">
          <input type="radio" name="role" />
          <div>
            <p className="font-medium">Manager</p>
            <p className="text-xs text-gray-500">Manage assigned team</p>
          </div>
        </label>
      </div>

      <div className="flex justify-end gap-3 mt-8">
        <button onClick={handleClose} className="px-4 py-2 border rounded-lg">
          Cancel
        </button>
        <button className="px-6 py-2 bg-[#1f2a44] text-white rounded-lg">
          Update User Role
        </button>
      </div>
    </ModalWrapper>
  );
}
