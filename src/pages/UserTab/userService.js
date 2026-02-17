/*
=====================================================
USER SERVICE (Backend Integration Template)
Replace dummy functions with real API calls
=====================================================
*/

const API_BASE = "http://localhost:5000/api/users"; 
// 🔁 Change this to your real backend base URL

/* ==================================================
   GET ALL USERS
================================================== */
export async function getUsers() {
  try {
    const res = await fetch(API_BASE);
    if (!res.ok) throw new Error("Failed to fetch users");
    return await res.json();
  } catch (err) {
    console.error("getUsers error:", err);

    // 🔹 Fallback dummy users (for UI testing only)
    return dummyUsers;
  }
}

/* ==================================================
   GET USER BY ID
================================================== */
export async function getUserById(id) {
  try {
    const res = await fetch(`${API_BASE}/${id}`);
    if (!res.ok) throw new Error("Failed to fetch user");
    return await res.json();
  } catch (err) {
    console.error("getUserById error:", err);

    // 🔹 Fallback dummy user
    return dummyUsers.find(u => u._id === id);
  }
}

/* ==================================================
   UPDATE USER
================================================== */
export async function updateUser(id, data) {
  const res = await fetch(`${API_BASE}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  return await res.json();
}

/* ==================================================
   DELETE USER
================================================== */
export async function deleteUser(id) {
  const res = await fetch(`${API_BASE}/${id}`, {
    method: "DELETE",
  });

  return await res.json();
}

/* ==================================================
   CREATE USER
================================================== */
export async function createUser(data) {
  const res = await fetch(API_BASE, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  return await res.json();
}

/* ==================================================
   DUMMY USERS (UI TESTING)
================================================== */

const dummyUsers = [
  {
    _id: "1",
    name: "Johnathan Doe",
    email: "j.doe@facilitymanagement.com",
    phone: "+1 (555) 902-3481",
    role: "Admin",
    status: "Active",
    jobTitle: "Senior Facility Manager",
    lastLogin: "2 hours ago",
    tasks: 1284,
    completionRate: 98.2,
    attendance: 96.5,
    pendingRequests: 5,
  },
  {
    _id: "2",
    name: "Sarah Chen",
    email: "s.chen@facilitymanagement.com",
    phone: "+1 (555) 123-4567",
    role: "Manager",
    status: "Active",
    jobTitle: "Facility Manager",
    lastLogin: "5 mins ago",
    tasks: 540,
    completionRate: 95.1,
    attendance: 93.2,
    pendingRequests: 2,
  },
];
