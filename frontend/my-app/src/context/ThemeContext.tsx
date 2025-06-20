"use client";

import { createContext, useContext, useEffect, useState } from "react";

type ThemeType = "light" | "dark";

interface ThemeContextProps {
  theme: ThemeType;
  compact: boolean;
  primaryColor: string;
  accessible: boolean;
  largeText: boolean;
  highContrast: boolean;
  setTheme: (theme: ThemeType) => void;
  setCompact: (value: boolean) => void;
  setPrimaryColor: (color: string) => void;
  setAccessible: (value: boolean) => void;
  setLargeText: (value: boolean) => void;
  setHighContrast: (value: boolean) => void;
}

const ThemeContext = createContext<ThemeContextProps | null>(null);

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [theme, setThemeState] = useState<ThemeType>("light");
  const [compact, setCompactState] = useState<boolean>(false);
  const [primaryColor, setPrimaryColorState] = useState<string>("#1677ff");

  // Accesibilidad
  const [accessible, setAccessibleState] = useState<boolean>(false);
  const [largeText, setLargeTextState] = useState<boolean>(false);
  const [highContrast, setHighContrastState] = useState<boolean>(false);

  useEffect(() => {
    const storedTheme = localStorage.getItem("user-theme") as ThemeType;
    const storedCompact = localStorage.getItem("user-compact");
    const storedColor = localStorage.getItem("user-primary-color");

    const storedAccessible = localStorage.getItem("user-accessible");
    const storedLargeText = localStorage.getItem("user-large-text");
    const storedHighContrast = localStorage.getItem("user-high-contrast");

    if (storedTheme) setThemeState(storedTheme);
    if (storedCompact) setCompactState(storedCompact === "true");
    if (storedColor) setPrimaryColorState(storedColor);

    if (storedAccessible) setAccessibleState(storedAccessible === "true");
    if (storedLargeText) setLargeTextState(storedLargeText === "true");
    if (storedHighContrast) setHighContrastState(storedHighContrast === "true");
  }, []);

  // Aplicar clases de accesibilidad al body
  useEffect(() => {
    const body = document.body;

    if (largeText) {
      body.classList.add("accessible-large-text");
    } else {
      body.classList.remove("accessible-large-text");
    }

    if (highContrast) {
      body.classList.add("accessible-high-contrast");
    } else {
      body.classList.remove("accessible-high-contrast");
    }
  }, [largeText, highContrast]);

  const setTheme = (newTheme: ThemeType) => {
    setThemeState(newTheme);
    localStorage.setItem("user-theme", newTheme);
  };

  const setCompact = (value: boolean) => {
    setCompactState(value);
    localStorage.setItem("user-compact", value.toString());
  };

  const setPrimaryColor = (color: string) => {
    setPrimaryColorState(color);
    localStorage.setItem("user-primary-color", color);
  };

  const setAccessible = (value: boolean) => {
    setAccessibleState(value);
    localStorage.setItem("user-accessible", value.toString());
  };

  const setLargeText = (value: boolean) => {
    setLargeTextState(value);
    localStorage.setItem("user-large-text", value.toString());
  };

  const setHighContrast = (value: boolean) => {
    setHighContrastState(value);
    localStorage.setItem("user-high-contrast", value.toString());
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        compact,
        primaryColor,
        accessible,
        largeText,
        highContrast,
        setTheme,
        setCompact,
        setPrimaryColor,
        setAccessible,
        setLargeText,
        setHighContrast,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme debe usarse dentro de <ThemeProvider>");
  return context;
};
