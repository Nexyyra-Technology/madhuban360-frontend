/**
 * Auth context – provides user and setUser so the rest of the app can use them.
 * User is persisted in localStorage (including lastLoginAt from login response).
 */
import { createContext, useContext, useState, useEffect } from "react";

const USER_STORAGE_KEY = "user";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUserState] = useState(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(USER_STORAGE_KEY);
      if (stored) setUserState(JSON.parse(stored));
    } catch (_) {}
  }, []);

  function setUser(nextUser) {
    setUserState(nextUser);
    if (nextUser != null) {
      try {
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(nextUser));
      } catch (_) {}
    } else {
      try {
        localStorage.removeItem(USER_STORAGE_KEY);
      } catch (_) {}
    }
  }

  return (
    <AuthContext.Provider value={{ user, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
