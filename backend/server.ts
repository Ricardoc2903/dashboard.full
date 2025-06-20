// src/server.ts
import express from "express";
import cors from "cors";
import path from "path";
import fileUpload from "express-fileupload";
import { fileURLToPath } from "url";
import authRoutes from "./routes/auth";
import equiposRoutes from "./routes/equipos";
import mantenimientosRoutes from "./routes/maintenances";
import gruposRoutes from "./routes/grupos";
import statsRoutes from "./routes/stats";
import authenticateJWT from "./middleware/authenticateJWT";
import authProtegidoRoutes from "./routes/authProtegido";


// Simular __dirname en ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Middlewares generales
app.use(cors());
app.use(express.json());

// Middleware para recibir archivos en req.files
app.use(
  fileUpload({
    createParentPath: true,
    limits: { fileSize: 20 * 1024 * 1024 }, // 20 MB
  })
);

// 👉 Rutas públicas
app.use("/api/auth", authRoutes);

// // 👉 Middleware de autenticación (después de públicas)
app.use(authenticateJWT);

// 👉 Rutas privadas (requieren token)
app.use("/api/authProtegido", authProtegidoRoutes);
app.use("/api/equipos", equiposRoutes);
app.use("/api/mantenimientos", mantenimientosRoutes);
app.use("/api/grupos", gruposRoutes);
app.use("/api/stats", statsRoutes);

// Puerto
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor backend corriendo en el puerto ${PORT}`);
});
