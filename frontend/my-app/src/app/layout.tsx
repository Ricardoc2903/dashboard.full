"use client";

// import type { Metadata } from "next";
import { AuthProvider } from "@/context/AuthContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { Geist, Geist_Mono } from "next/font/google";
import { ConfigProvider, theme as antdTheme } from "antd";
import { useTheme } from "@/context/ThemeContext";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

function ThemeWrapper({ children }: { children: React.ReactNode }) {
  const { theme, compact, primaryColor } = useTheme();

  return (
    <ConfigProvider
      theme={{
        algorithm:
          theme === "dark"
            ? antdTheme.darkAlgorithm
            : antdTheme.defaultAlgorithm,
        token: {
          colorPrimary: primaryColor,
        },
      }}
      componentSize={compact ? "small" : "middle"}
    >
      {children}
    </ConfigProvider>
  );
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ThemeProvider>
          <AuthProvider>
            <ThemeWrapper>{children}</ThemeWrapper>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
