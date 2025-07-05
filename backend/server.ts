import express from "express";
import cors from "cors";
import path from "path";
import fileUpload from "express-fileupload";
import { fileURLToPath } from "url";
import authRoutes from "./routes/auth.js";
import equiposRoutes from "./routes/equipos.js";
import mantenimientosRoutes from "./routes/maintenances.js";
import gruposRoutes from "./routes/grupos.js";
import statsRoutes from "./routes/stats.js";
import authenticateJWT from "./middleware/authenticateJWT.js";
// import authProtegidoRoutes from "./routes/authProtegido.js";


// Simular __dirname en ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Middlewares generales
app.use(express.json());

app.use(cors({
  origin: "https://dashboard-full-5gu3.vercel.app",  // o "*", solo para desarrollo
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  credentials: true
}));


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
// app.use("/api/authProtegido", authProtegidoRoutes);
app.use("/api/equipos", equiposRoutes);
app.use("/api/mantenimientos", mantenimientosRoutes);
app.use("/api/grupos", gruposRoutes);
app.use("/api/stats", statsRoutes);

// Puerto
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor backend corriendo en el puerto ${PORT}`);
});
