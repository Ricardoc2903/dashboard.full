import express, { Response } from "express";
import { PrismaClient } from "@prisma/client";
import { AuthenticatedRequest } from "../middleware/authenticateJWT";

const router = express.Router();
const prisma = new PrismaClient();

// ✅ GET: Obtener todos los grupos (sin filtro por usuario)
router.get("/", async (_req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const grupos = await prisma.equipmentGroup.findMany({
      orderBy: { name: "asc" },
    });

    res.status(200).json(grupos);
  } catch (error) {
    console.error("Error al obtener grupos:", error);
    res.status(500).json({ message: "Error al obtener grupos" });
  }
});

// ✅ POST: Crear grupo (asociado al usuario autenticado)
router.post("/", async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { name } = req.body;
  const userId = req.user?.id;

  if (!name || typeof name !== "string") {
    res.status(400).json({ message: "El nombre es requerido" });
    return;
  }

  if (!userId) {
    res.status(401).json({ message: "Usuario no autenticado" });
    return;
  }

  try {
    const nuevoGrupo = await prisma.equipmentGroup.create({
      data: {
        name,
        user: {
          connect: { id: userId },
        },
      },
    });

    res.status(201).json(nuevoGrupo);
  } catch (error) {
    console.error("Error al crear grupo:", error);
    res.status(500).json({ message: "Error al crear grupo" });
  }
});

// ✅ DELETE: Eliminar grupo (solo si no tiene equipos asociados)
router.delete("/:id", async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const userId = Number(id);

  try {
    // Verificar que el grupo exista
    const grupo = await prisma.equipmentGroup.findUnique({ where: { id: userId } });

    if (!grupo) {
      res.status(404).json({ message: "Grupo no encontrado" });
      return;
    }

    // Verificar si tiene equipos asociados
    const equipos = await prisma.equipment.findMany({
      where: { groupId: userId },
    });

    if (equipos.length > 0) {
      res.status(400).json({
        message: "No se puede eliminar el grupo porque tiene equipos asociados.",
      });
      return;
    }

    await prisma.equipmentGroup.delete({ where: { id: userId } });
    res.status(204).send();
  } catch (error) {
    console.error("Error al eliminar grupo:", error);
    res.status(500).json({ message: "Error al eliminar grupo" });
  }
});

export default router;
