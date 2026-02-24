/**
 * Shared user utilities – reduce duplication across App, LoginScreen, Dashboards, Profiles
 */
const MANAGER_ROLES = ["manager", "admin", "supervisor"];

export function isManagerRole(user) {
  if (!user?.role) return false;
  return MANAGER_ROLES.includes(String(user.role).toLowerCase());
}

export function getStoredUser() {
  try {
    return JSON.parse(localStorage.getItem("user") || "null");
  } catch {
    return null;
  }
}

export function getUserDisplayName(user, fallback = "User") {
  if (!user) return fallback;
  if (user.fullName) return user.fullName;
  if (user.firstName && user.lastName) return `${user.firstName} ${user.lastName}`;
  if (user.firstName) return user.firstName;
  if (user.displayName) return user.displayName;
  if (user.name && !["Admin", "User", "admin", "user"].includes(user.name)) return user.name;
  if (user.username && !["Admin", "User", "admin", "user"].includes(user.username)) return user.username;
  return fallback;
}

export function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good Morning";
  if (h < 17) return "Good Afternoon";
  return "Good Evening";
}
