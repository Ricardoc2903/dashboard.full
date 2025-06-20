// routes/authProtegido.ts
import express, { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import authenticateJWT, { AuthenticatedRequest } from "../middleware/authenticateJWT";
import { requireAdmin } from "../middleware/requireAdmin";

dotenv.config();

const router = express.Router();
const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || "clave-secreta";

/**
 * Crear un usuario (solo ADMINs)
 */
router.post(
  "/create-user",
  authenticateJWT,
  requireAdmin,
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { name, email, password, role } = req.body;
      if (!name || !email || !password || !role) {
        res.status(400).json({ message: "Faltan campos obligatorios." });
        return;
      }

      const existing = await prisma.user.findUnique({ where: { email } });
      if (existing) {
        res.status(400).json({ message: "El usuario ya existe." });
        return;
      }

      const hashed = await bcrypt.hash(password, 10);
      const newUser = await prisma.user.create({
        data: { name, email, password: hashed, role },
      });

      res.status(201).json({
        user: {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
        },
      });
    } catch (err: any) {
      console.error("Error al crear usuario admin:", err);
      res.status(500).json({ message: "Error interno.", details: err.message });
    }
  }
);

/**
 * Cambiar contraseña (cualquier usuario autenticado)
 */
router.put(
  "/change-password",
  authenticateJWT,
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user!.id;
      const { currentPassword, newPassword } = req.body;
      if (!currentPassword || !newPassword) {
        res.status(400).json({ message: "Faltan campos obligatorios." });
        return;
      }

      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (!user) {
        res.status(404).json({ message: "Usuario no encontrado." });
        return;
      }

      const match = await bcrypt.compare(currentPassword, user.password);
      if (!match) {
        res.status(400).json({ message: "Contraseña actual incorrecta." });
        return;
      }

      const hashed = await bcrypt.hash(newPassword, 10);
      await prisma.user.update({
        where: { id: userId },
        data: { password: hashed },
      });

      res.status(200).json({ message: "Contraseña actualizada correctamente." });
    } catch (err: any) {
      console.error("Error al cambiar contraseña:", err);
      res.status(500).json({ message: "Error interno.", details: err.message });
    }
  }
);

export default router;
