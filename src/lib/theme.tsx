"use client";

import React, { createContext, useContext, useEffect } from "react";

const ThemeContext = createContext("dark");

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", "dark");
    try { localStorage.setItem("theme", "dark"); } catch {}
  }, []);

  return (
    <ThemeContext.Provider value="dark">
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
