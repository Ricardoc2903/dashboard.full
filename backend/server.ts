import express from "express";
import cors from "cors";
import path from "path";
import fileUpload from "express-fileupload";
import { fileURLToPath } from "url";

import authRoutes from "./routes/auth.js";
import equiposRoutes from "./routes/equipos.js";
import mantenimientosRoutes from "./routes/maintenances.js";
import gruposRoutes from "./routes/grupos.js";
import usersRoutes from "./routes/users.js";
import statsRoutes from "./routes/stats.js";
import authenticateJWT from "./middleware/authenticateJWT.js";

// __dirname en ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// --- CORS ---
const allowedOrigins = [
  "http://localhost:3000",
  "https://dashboard-full-one.vercel.app",
  "https://dashboard-full-5gu3.vercel.app",
];
const vercelRegex = /^https:\/\/dashboard-full(-[a-z0-9]+)?\.vercel\.app$/;

app.use(cors({
  origin(origin, cb) {
    if (!origin) return cb(null, true);
    if (allowedOrigins.includes(origin) || vercelRegex.test(origin)) return cb(null, true);
    return cb(new Error(`Not allowed by CORS: ${origin}`));
  },
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: false,
}));
app.options("*", cors());

// --- Body parsers ---
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- Uploads ---
app.use(fileUpload({
  createParentPath: true,
  limits: { fileSize: 20 * 1024 * 1024 },
}));

// --- Rutas públicas ---
app.use("/api/auth", authRoutes);

// --- Auth middleware (después de públicas) ---
app.use(authenticateJWT);

// --- Rutas privadas ---
app.use("/api/equipos", equiposRoutes);
app.use("/api/mantenimientos", mantenimientosRoutes);
app.use("/api/grupos", gruposRoutes);
app.use("/api/stats", statsRoutes);
app.use("/api/users", usersRoutes); // ← CORREGIDO

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor backend corriendo en el puerto ${PORT}`);
});
