/*
=====================================================
DELETE USER MODAL
Replace delete handler with backend API
=====================================================
*/

export default function DeleteUserModal({ userId, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
      <div className="bg-white w-[450px] rounded-xl p-8 shadow-xl">

        <h2 className="text-lg font-semibold text-red-600 mb-4">
          Delete User
        </h2>

        <p className="text-sm text-gray-600 mb-6">
          Are you sure you want to delete this user?
        </p>

        <div className="flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 border rounded-lg">
            Cancel
          </button>
          <button className="px-4 py-2 bg-red-600 text-white rounded-lg">
            Delete User
          </button>
        </div>
      </div>
    </div>
  );
}
