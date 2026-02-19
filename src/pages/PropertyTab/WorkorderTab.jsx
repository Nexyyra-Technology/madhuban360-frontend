import { useState } from "react";

const workOrdersData = [
  { id: "WO-1024", description: "HVAC repair in... AC making unusual rattling noise", priority: "Emergency", priorityClass: "bg-red-100 text-red-800", status: "In Progress", statusClass: "bg-amber-100 text-amber-800", staff: "Marcus Chen", staffAvatar: true, dueDate: "Oct 24, 2023", action: "View" },
  { id: "WO-1025", description: "Leaking pipe in... Reported near pillar C4", priority: "High", priorityClass: "bg-orange-100 text-orange-800", status: "New", statusClass: "bg-sky-100 text-sky-800", staff: "Unassigned", staffAvatar: false, dueDate: "Oct 25, 2023", action: "Assign" },
  { id: "WO-1026", description: "Broken window... Air leaking during high winds", priority: "Medium", priorityClass: "bg-blue-100 text-blue-800", status: "Assigned", statusClass: "bg-purple-100 text-purple-800", staff: "Sarah Miller", staffAvatar: true, dueDate: "Oct 28, 2023", action: "View" },
  { id: "WO-1027", description: "Annual Fire... Scheduled maintenance for all floors", priority: "Low", priorityClass: "bg-gray-100 text-gray-800", status: "On Hold", statusClass: "bg-green-100 text-green-800", staff: "Jim Peters", staffAvatar: true, dueDate: "Nov 02, 2023", action: "Resume" },
  { id: "WO-1028", description: "Elevator B... Monthly safety audit complete", priority: "High", priorityClass: "bg-orange-100 text-orange-800", status: "Completed", statusClass: "bg-emerald-100 text-emerald-800", staff: "Elena Rodriguez", staffAvatar: true, dueDate: "Oct 20, 2023", action: "History" },
];

export default function WorkorderTab() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Statuses");
  const [priorityFilter, setPriorityFilter] = useState("All Priorities");
  const [dueFilter, setDueFilter] = useState("This Week");

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-xl font-bold text-[#0d121b]">Work Orders</h2>
        <div className="relative w-64 sm:w-72">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>
          <input
            type="text"
            placeholder="Search work orders..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-lg bg-white text-sm outline-none focus:ring-2 focus:ring-[#1f2937]/20"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Total Open</h4>
          <p className="text-2xl font-bold text-[#0d121b] mt-1">24</p>
          <p className="text-sm text-green-600 mt-1">+12%</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Due Today</h4>
          <p className="text-2xl font-bold text-[#0d121b] mt-1">5</p>
          <p className="text-sm text-gray-500 mt-1">0%</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Emergency</h4>
          <p className="text-2xl font-bold text-[#0d121b] mt-1">2</p>
          <p className="text-sm text-red-600 mt-1">-5%</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-4 py-2.5 border border-gray-300 rounded-lg bg-white text-sm">
          <option>All Statuses</option>
          <option>New</option>
          <option>Assigned</option>
          <option>In Progress</option>
          <option>On Hold</option>
          <option>Completed</option>
        </select>
        <select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)} className="px-4 py-2.5 border border-gray-300 rounded-lg bg-white text-sm">
          <option>All Priorities</option>
          <option>Emergency</option>
          <option>High</option>
          <option>Medium</option>
          <option>Low</option>
        </select>
        <select value={dueFilter} onChange={(e) => setDueFilter(e.target.value)} className="px-4 py-2.5 border border-gray-300 rounded-lg bg-white text-sm">
          <option>This Week</option>
          <option>Today</option>
          <option>This Month</option>
          <option>Overdue</option>
        </select>
        <button className="ml-auto flex items-center gap-2 bg-[#1f2937] text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:opacity-90 transition">
          + Create Work Order
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-xs uppercase text-gray-500 tracking-wide">
              <tr>
                <th className="text-left py-3 px-4 font-semibold">ID</th>
                <th className="text-left py-3 px-4 font-semibold">Description</th>
                <th className="text-left py-3 px-4 font-semibold">Priority</th>
                <th className="text-left py-3 px-4 font-semibold">Status</th>
                <th className="text-left py-3 px-4 font-semibold">Staff</th>
                <th className="text-left py-3 px-4 font-semibold">Due Date</th>
                <th className="text-left py-3 px-4 font-semibold">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {workOrdersData.map((wo) => (
                <tr key={wo.id} className="hover:bg-gray-50">
                  <td className="py-3 px-4 font-medium text-[#0d121b]">#{wo.id}</td>
                  <td className="py-3 px-4 text-gray-700">{wo.description}</td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${wo.priorityClass}`}>{wo.priority}</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${wo.statusClass}`}>{wo.status}</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="flex items-center gap-2">
                      {wo.staffAvatar ? <span className="w-6 h-6 rounded-full bg-gray-300 inline-block" /> : null}
                      {wo.staff}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-gray-600">{wo.dueDate}</td>
                  <td className="py-3 px-4">
                    <button type="button" className="text-[#1f2937] font-semibold hover:underline">
                      {wo.action}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-4 py-3 px-4 border-t border-gray-200 bg-gray-50/50">
          <p className="text-sm text-gray-600">Showing 1 to 5 of 24 results</p>
          <div className="flex items-center gap-1">
            <button type="button" className="p-2 rounded-lg border border-gray-300 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-50" disabled>←</button>
            <button type="button" className="p-2 rounded-lg border border-gray-300 bg-white text-gray-600 hover:bg-gray-50">→</button>
          </div>
        </div>
      </div>
    </div>
  );
}
