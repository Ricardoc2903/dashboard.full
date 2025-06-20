
"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { jwtDecode } from "jwt-decode";
import { message } from "antd"; // ✅ para mostrar errores

interface User {
  id: string;
  email: string;
  name?: string;
  role: "ADMIN" | "USER"; // ✅ importante
}

interface DecodedToken {
  exp: number;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const isTokenExpired = (token: string): boolean => {
    try {
      const decoded = jwtDecode<DecodedToken>(token);
      return decoded.exp * 1000 < Date.now();
    } catch (error) {
      console.error("Token inválido:", error);
      return true;
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");

    if (token && userData) {
      if (isTokenExpired(token)) {
        logout();
      } else {
        try {
          const parsedUser = JSON.parse(userData);
          if (!parsedUser.role) {
            throw new Error("El usuario no tiene un rol válido");
          }
          setUser(parsedUser);
        } catch (e) {
          console.error("Error al leer datos del usuario:", e);
          logout();
        }
      }
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const token = localStorage.getItem("token");
      if (token && isTokenExpired(token)) {
        logout();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const login = (token: string, userData: User) => {
    if (!userData.role) {
      console.error("El usuario no tiene un rol definido. Cancelando login.");
      message.error("Tu cuenta no tiene permisos válidos.");
      return;
    }

    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);
    router.push("/dashboard");
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    router.push("/auth");
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth debe usarse dentro de un AuthProvider");
  return context;
};
