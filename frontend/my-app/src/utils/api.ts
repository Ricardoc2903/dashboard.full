import axios from "axios";

// Configuración de Axios
const api = axios.create({
  baseURL: "http://localhost:3001/api", // Ajusta la URL según tu backend
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor para incluir el token en cada petición
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Función para iniciar sesión
export const loginUser = async (email: string, password: string) => {
  const response = await api.post("/auth/login", { email, password });
  return response.data;
};

// Función para registrar usuario
export const registerUser = async (email: string, password: string) => {
  const response = await api.post("/auth/register", { email, password });
  return response.data;
};

// Función para obtener datos del usuario autenticado
export const getUserProfile = async () => {
  const response = await api.get("/auth/me");
  return response.data;
};

export default api;
