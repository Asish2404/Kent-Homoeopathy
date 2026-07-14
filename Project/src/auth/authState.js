import { useEffect, useState } from "react";

const getAuth = () => {
  const isLoggedIn = window.localStorage.getItem("isLoggedIn") === "true";
  const role = window.localStorage.getItem("role");
  const userName = window.localStorage.getItem("userName");

  // Customer login flow stores a full user object under "user".
  const customerUser = (() => {
    try {
      const raw = window.localStorage.getItem("user");
      if (!raw) return null;
      return JSON.parse(raw);
    } catch {
      return null;
    }
  })();

  if (!isLoggedIn) return { isLoggedIn: false, role: null, user: null };

  if (role === "admin") {
    return {
      isLoggedIn: true,
      role: "admin",
      user: { user_name: userName || "Administrator", email: "admin@drkent.com" },
    };
  }

  // Default to customer behavior.
  return {
    isLoggedIn: true,
    role: "customer",
    user: customerUser,
  };
};

export const useAuthState = () => {
  const [auth, setAuth] = useState(getAuth());

  useEffect(() => {
    const onStorage = () => setAuth(getAuth());
    window.addEventListener("storage", onStorage);

    // Also handle same-tab updates (e.g., after login/logout).
    const id = window.setInterval(onStorage, 250);

    return () => {
      window.removeEventListener("storage", onStorage);
      window.clearInterval(id);
    };
  }, []);

  return auth;
};

