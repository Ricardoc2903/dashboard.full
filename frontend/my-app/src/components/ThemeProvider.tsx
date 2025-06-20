// src/components/ThemeProvider.tsx
"use client";

import { ReactNode, useEffect, useState } from "react";
import { ConfigProvider, theme as antdTheme } from "antd";

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [compact, setCompact] = useState(false);

  useEffect(() => {
    const storedTheme = localStorage.getItem("app-theme");
    const storedCompact = localStorage.getItem("app-compact");

    if (storedTheme === "dark" || storedTheme === "light") {
      setTheme(storedTheme);
    }
    if (storedCompact === "true" || storedCompact === "false") {
      setCompact(storedCompact === "true");
    }
  }, []);

  return (
    <ConfigProvider
      theme={{
        algorithm:
          theme === "dark"
            ? antdTheme.darkAlgorithm
            : antdTheme.defaultAlgorithm,
        token: {
          colorPrimary: "#1677ff",
        },
      }}
      componentSize={compact ? "small" : "middle"}
    >
      {children}
    </ConfigProvider>
  );
};
