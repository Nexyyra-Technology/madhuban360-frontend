/*
=====================================================
ADD USER MODAL
Replace submit handler with backend API
=====================================================
*/

export default function AddUserModal({ onClose }) {
  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
      <div className="bg-white w-[600px] rounded-xl p-8 shadow-xl">

        <h2 className="text-lg font-semibold mb-6">Add New User</h2>

        <div className="space-y-4">
          <input placeholder="Full Name" className="w-full border px-4 py-2 rounded-lg" />
          <input placeholder="Email Address" className="w-full border px-4 py-2 rounded-lg" />
          <input placeholder="Phone Number" className="w-full border px-4 py-2 rounded-lg" />
        </div>

        <div className="flex justify-end gap-3 mt-8">
          <button onClick={onClose} className="px-4 py-2 border rounded-lg">
            Cancel
          </button>
          <button className="px-5 py-2 bg-[#1f2a44] text-white rounded-lg">
            Save User
          </button>
        </div>
      </div>
    </div>
  );
}
