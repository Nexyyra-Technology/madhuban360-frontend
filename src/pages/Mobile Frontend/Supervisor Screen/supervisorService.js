/**
 * Supervisor API Service
 * ---------------------
 * Reuses manager/task APIs for supervisor-scoped data.
 * Backend: /api/tasks, /api/users, /api/users/me
 */

import {
  getManagerTasks,
  getManagerSupervisors,
  computeDashboardFromTasks,
  approveTask as apiApproveTask,
  rejectTask as apiRejectTask,
  getManagerProfile,
} from "../manager Screen/managerService";
import { getTaskById, updateTaskStatus } from "../../TaskTab/taskService";

export { getManagerProfile as getSupervisorProfile };

/** Fetch tasks for supervisor dashboard (In Progress + Pending counts, lists) */
export async function getSupervisorTasks(filters = {}) {
  return getManagerTasks(filters);
}

/** Staff/team members for supervisor (Staff Online, Staff List) */
export async function getSupervisorStaff(prefetchedTasks = null) {
  return getManagerSupervisors(prefetchedTasks);
}

/** Dashboard stats: inProgressCount, pendingCount */
export function getSupervisorDashboardStats(tasks) {
  const stats = computeDashboardFromTasks(tasks);
  const list = Array.isArray(tasks) ? tasks : [];
  const inProgress = list.filter(
    (t) => (t.rawStatus || "").toUpperCase() === "IN_PROGRESS"
  ).length;
  const pending = list.filter((t) => {
    const s = (t.rawStatus || t.status || "").toUpperCase().replace(/\s/g, "_");
    return ["TO_DO", "PENDING"].includes(s);
  }).length;
  return {
    ...stats,
    inProgress,
    pending,
  };
}

/** Single task details for View Details popup */
export async function getSupervisorTaskById(id) {
  return getTaskById(id);
}

/** Approve task (verification) */
export async function approveTask(taskId) {
  return apiApproveTask(taskId);
}

/** Reject task (verification) */
export async function rejectTask(taskId, comment) {
  try {
    return await apiRejectTask(taskId);
  } catch {
    await updateTaskStatus(taskId, "IN_PROGRESS");
    return { success: true };
  }
}

/** Mock/placeholder: attendance & leave data (replace with real API when available) */
export async function getAttendanceLeaveData(month) {
  const now = new Date();
  const year = month ? new Date(month).getFullYear() : now.getFullYear();
  const m = month ? new Date(month).getMonth() : now.getMonth();
  const daysInMonth = new Date(year, m + 1, 0).getDate();
  const days = [];
  for (let d = 1; d <= Math.min(daysInMonth, 14); d++) {
    days.push({
      date: d,
      percentage: d % 5 === 0 ? 42 : 92 + (d % 5),
      isSelected: d === now.getDate() && m === now.getMonth(),
    });
  }
  return {
    month: new Date(year, m).toLocaleString("en-IN", { month: "long", year: "numeric" }),
    year,
    monthIndex: m,
    totalStaff: 15,
    present: 2,
    onLeave: 4,
    staffOnLeave: [
      { id: "1", name: "Rahul V.", type: "Sick Leave" },
      { id: "2", name: "Sneha P.", type: "Casual" },
      { id: "3", name: "Amit K.", type: "Unplanned" },
      { id: "4", name: "Priya S.", type: "Personal" },
    ],
    leaveRequests: [
      {
        id: "lr1",
        name: "James Wilson",
        avatar: null,
        timeAgo: "2h ago",
        leaveType: "Sick Leave",
        dateRange: "Oct 24 - Oct 25",
        reason: "Not feeling well, fever since last night",
      },
      {
        id: "lr2",
        name: "Sarah Chen",
        avatar: null,
        timeAgo: "5h ago",
        leaveType: "Casual Leave",
        dateRange: "Oct 24 - Oct 25",
        reason: "Family function to attend out of town.",
      },
    ],
    days,
  };
}

/** Mock: staff list for attendance (replace with real API when available) */
export async function getStaffList(filters = {}) {
  const list = [
    { id: "1", name: "Jane Smith", role: "Sales Department", status: "ABSENT", reason: "Unplanned", duration: "1 Day" },
    { id: "2", name: "John Doe", role: "Manager - Operations", status: "PRESENT" },
    { id: "3", name: "Rahul Kapoor", role: "IT Specialist", status: "ON LEAVE", reason: "Sick Leave", duration: "3 Days (Day 2)" },
    { id: "4", name: "Anita Mishra", role: "HR Associate", status: "PRESENT" },
    { id: "5", name: "Vikram Singh", role: "Security Head", status: "ABSENT", reason: "Casual Leave", duration: "2 Days" },
  ];
  const presentCount = list.filter((s) => s.status === "PRESENT").length;
  const absentCount = list.filter((s) => s.status === "ABSENT").length;
  let filtered = list;
  if (filters.tab === "Present") filtered = list.filter((s) => s.status === "PRESENT");
  if (filters.tab === "Absent") filtered = list.filter((s) => s.status === "ABSENT" || s.status === "ON LEAVE");
  if (filters.search) {
    const q = (filters.search || "").toLowerCase();
    filtered = filtered.filter(
      (s) =>
        (s.name && s.name.toLowerCase().includes(q)) ||
        (s.role && s.role.toLowerCase().includes(q))
    );
  }
  return {
    list: filtered,
    total: list.length,
    present: presentCount,
    absent: absentCount,
  };
}
