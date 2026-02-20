import { useParams, useNavigate } from "react-router-dom";
import { getUserById } from "./userService";
import { useEffect, useState } from "react";
import ResetPasswordModal from "./ResetPasswordModal";

export default function UserSummary() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState("Overview");
  const [showResetPasswordModal, setShowResetPasswordModal] = useState(false);

  useEffect(() => {
    async function load() {
      const data = await getUserById(id);
      setUser(data);
    }
    load();
  }, [id]);

  if (!user) return null;

  const resetPasswordModal = showResetPasswordModal && (
    <ResetPasswordModal
      userId={id}
      userName={user.name}
      onClose={() => setShowResetPasswordModal(false)}
      onSuccess={() => setShowResetPasswordModal(false)}
    />
  );

  const initials = user.name
    ?.split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase() || "?";

  return (
    <div className="p-8 bg-[#f5f7fb] min-h-screen">
      {resetPasswordModal}
      <button onClick={() => navigate(-1)} className="text-sm text-blue-600 mb-6">← Back</button>

      {/* Header Section */}
      <div className="bg-white rounded-xl p-8 shadow-sm mb-6">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-start gap-6">
            <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center text-3xl font-bold text-blue-600">
              {initials}
            </div>
            <div>
              <h1 className="text-2xl font-bold">{user.name}</h1>
              <p className="text-gray-600">{user.jobTitle}</p>
              <div className="text-xs text-gray-500 mt-2 space-y-1">
                <p>📧 {user.email}</p>
                <p>📞 {user.phone || "N/A"}</p>
                <p>📅 Joined Jan 16, 2023</p>
              </div>
              <span className="inline-block mt-3 px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                ● Active Profile
              </span>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => navigate(`/users/edit/${id}`)}
              className="px-4 py-2 border rounded-lg font-medium text-gray-700"
            >
              ✏️ Edit
            </button>
            <button
              type="button"
              onClick={() => setShowResetPasswordModal(true)}
              className="px-4 py-2 bg-gray-700 text-white rounded-lg font-medium hover:bg-gray-800 cursor-pointer"
            >
              🔄 Reset Password
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-green-50 to-transparent p-4 rounded-lg">
            <p className="text-gray-600 text-xs">Total Tasks</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{user.tasks || 1284}</p>
            <p className="text-xs text-green-600 mt-2">↑ 23 this week</p>
          </div>
          <div className="bg-gradient-to-br from-blue-50 to-transparent p-4 rounded-lg">
            <p className="text-gray-600 text-xs">Completion Rate</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{user.completionRate || 98.2}%</p>
            <p className="text-xs text-blue-600 mt-2">↑ Higher than avg</p>
          </div>
          <div className="bg-gradient-to-br from-yellow-50 to-transparent p-4 rounded-lg">
            <p className="text-gray-600 text-xs">Attendance Score</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{user.attendance || 96.5}%</p>
            <p className="text-xs text-yellow-600 mt-2">↑ 2.3% monthly</p>
          </div>
          <div className="bg-gradient-to-br from-red-50 to-transparent p-4 rounded-lg">
            <p className="text-gray-600 text-xs">Pending Requests</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{user.pendingRequests || 5}</p>
            <p className="text-xs text-red-600 mt-2">⚠️ Needs attention</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm">
        <div className="flex border-b">
          {["Overview", "Assigned Facilities", "Task History", "Permissions"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-4 text-sm font-medium border-b-2 transition ${
                activeTab === tab
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-600 hover:text-gray-900"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="p-8">
          {activeTab === "Overview" && (
            <div className="grid grid-cols-2 gap-8">
              {/* Account Information */}
              <section>
                <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" />
                  </svg>
                  ACCOUNT INFORMATION
                </h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase">Full Name</p>
                    <p className="text-gray-900">{user.name}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase">Employed By</p>
                    <p className="text-gray-900">FMS-8829-JD</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase">Department</p>
                    <p className="text-gray-900">Maintenance</p>
                  </div>
                </div>
              </section>

              {/* Security & Access */}
              <section>
                <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                  </svg>
                  SECURITY & ACCESS
                </h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase">Role Tier</p>
                    <p className="text-gray-900">Senior Admin</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase">Last Login</p>
                    <p className="text-gray-900">2 hours ago | 8/18 @10 PM</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase">2FA Status</p>
                    <p className="text-gray-900 flex items-center gap-2">
                      <span className="w-2 h-2 bg-green-500 rounded-full"></span> Enabled
                    </p>
                  </div>
                </div>
              </section>
            </div>
          )}

          {activeTab === "Assigned Facilities" && (
            <div className="space-y-3">
              {[
                { name: "North Wing Hospital", type: "HEALTHCARE • 235,000 sq ft" },
                { name: "Downtown Office Co.", type: "COMMERCIAL • 100,000 sq ft" },
              ].map((facility, i) => (
                <div key={i} className="border rounded-lg p-4">
                  <img src="https://via.placeholder.com/100" alt="" className="w-16 h-16 rounded-lg mb-3" />
                  <p className="font-medium">{facility.name}</p>
                  <p className="text-xs text-gray-500">{facility.type}</p>
                </div>
              ))}
            </div>
          )}

          {activeTab === "Task History" && (
            <p className="text-gray-500">No task history available</p>
          )}

          {activeTab === "Permissions" && (
            <p className="text-gray-500">Permissions configuration coming soon</p>
          )}
        </div>
      </div>
    </div>
  );
}
