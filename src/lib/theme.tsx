import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

type Theme = "dark" | "light";
const ThemeContext = createContext<{ theme: Theme; setTheme: (theme: Theme) => void } | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, updateTheme] = useState<Theme>("dark");
  useEffect(() => {
    try {
      const saved = localStorage.getItem("lume-theme");
      if (saved === "light" || saved === "dark") updateTheme(saved);
    } catch { /* The theme remains usable when storage is unavailable. */ }
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    document.documentElement.style.colorScheme = theme;
    document.querySelector('meta[name="theme-color"]')?.setAttribute("content", theme === "dark" ? "#0b0b0b" : "#ffffff");
  }, [theme]);

  const setTheme = (value: Theme) => {
    updateTheme(value);
    try { localStorage.setItem("lume-theme", value); } catch { /* Optional preference storage. */ }
  };

  return <ThemeContext.Provider value={{ theme, setTheme }}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used within ThemeProvider");
  return context;
}