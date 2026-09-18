"use client";

import { createContext, useContext, useEffect, useState } from "react";

const THEME_KEY = "kanyel_admin_theme";

const AdminThemeContext = createContext<{ dark: boolean; toggle: () => void }>({
  dark: false,
  toggle: () => {},
});

export function AdminThemeProvider({ children }: { children: React.ReactNode }) {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    try {
      setDark(window.localStorage.getItem(THEME_KEY) === "dark");
    } catch {
      // Ignore — defaults to light.
    }
  }, []);

  function toggle() {
    setDark((prev) => {
      const next = !prev;
      try {
        window.localStorage.setItem(THEME_KEY, next ? "dark" : "light");
      } catch {
        // Ignore — preference just won't persist.
      }
      return next;
    });
  }

  return (
    <AdminThemeContext.Provider value={{ dark, toggle }}>
      <div className={`min-h-screen ${dark ? "admin-dark" : ""}`}>{children}</div>
    </AdminThemeContext.Provider>
  );
}

export function useAdminTheme() {
  return useContext(AdminThemeContext);
}
