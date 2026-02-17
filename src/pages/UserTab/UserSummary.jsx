import { useParams } from "react-router-dom";
import { getUserById } from "./userService";
import { useEffect, useState } from "react";

/*
=====================================================
USER SUMMARY PAGE
=====================================================
*/

export default function UserSummary() {
  const { id } = useParams();
  const [user, setUser] = useState(null);

  useEffect(() => {
    async function load() {
      const data = await getUserById(id);
      setUser(data);
    }
    load();
  }, [id]);

  if (!user) return null;

  return (
    <div className="p-8 bg-[#f5f7fb] min-h-screen">

      <div className="bg-white p-8 rounded-xl shadow-sm">

        <h1 className="text-2xl font-semibold mb-2">
          {user.name}
        </h1>

        <p className="text-gray-600 mb-6">
          {user.jobTitle}
        </p>

        <div className="grid grid-cols-4 gap-4">
          <StatCard label="Total Tasks" value={user.tasks} />
          <StatCard label="Completion Rate" value={`${user.completionRate}%`} />
          <StatCard label="Attendance" value={`${user.attendance}%`} />
          <StatCard label="Pending Requests" value={user.pendingRequests} />
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value }) {
  return (
    <div className="bg-gray-50 p-4 rounded-lg">
      <p className="text-xs text-gray-500">{label}</p>
      <p className="text-lg font-semibold">{value}</p>
    </div>
  );
}
