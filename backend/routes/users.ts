import express from "express";
import { PrismaClient } from "@prisma/client";
import authenticateJWT from "../middleware/authenticateJWT";
import { AuthenticatedRequest } from "../middleware/authenticateJWT";

const router = express.Router();
const prisma = new PrismaClient();

// GET: Obtener todos los usuarios (solo admin)
router.get("/", authenticateJWT, async (req: AuthenticatedRequest, res): Promise<void> => {
  if (req.user?.role !== "ADMIN") {
    res.status(403).json({ message: "No autorizado" });
    return;
  }

  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener usuarios" });
  }
});

// PUT: Actualizar un usuario
router.put("/:id", authenticateJWT, async (req: AuthenticatedRequest, res): Promise<void> => {
  const { id } = req.params;
  const { name, email, role } = req.body;

  if (req.user?.role !== "ADMIN") {
    res.status(403).json({ message: "No autorizado" });
    return;
  }

  try {
    const updatedUser = await prisma.user.update({
      where: { id },
      data: { name, email, role },
    });
    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ error: "Error al actualizar usuario" });
  }
});

// DELETE: Eliminar un usuario
router.delete("/:id", authenticateJWT, async (req: AuthenticatedRequest, res): Promise<void> => {
  const { id } = req.params;

  if (req.user?.role !== "ADMIN") {
    res.status(403).json({ message: "No autorizado" });
    return;
  }

  try {
    await prisma.user.delete({ where: { id } });
    res.json({ message: "Usuario eliminado correctamente" });
  } catch (error) {
    res.status(500).json({ error: "Error al eliminar usuario" });
  }
});

export default router;
