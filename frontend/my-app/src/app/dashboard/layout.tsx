"use client";

import React, { ReactNode } from "react";
import SideNav from "@/components/SideNav";
import { useTheme } from "@/context/ThemeContext"; // 👈 Asegurate que exista y esté bien el path

const Layout = ({ children }: { children: ReactNode }) => {
  const { theme } = useTheme(); // 👈 Obtenemos el tema actual

  const backgroundColor = theme === "dark" ? "#1f1f1f" : "#f0f2f5";

  return (
    <div style={{ display: "flex", minHeight: "100vh", backgroundColor }}>
      <SideNav />
      <main
        style={{
          flex: 1,
          padding: "20px",
          overflowY: "auto",
          backgroundColor,
          transition: "background-color 0.3s ease",
        }}
      >
        {children}
      </main>
    </div>
  );
};

export default Layout;
