import express, { Response } from "express";
import { PrismaClient } from "@prisma/client";
import { AuthenticatedRequest } from "../middleware/authenticateJWT";

const router = express.Router();
const prisma = new PrismaClient();

// GET todos los grupos del usuario autenticado
router.get("/", async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const userId = req.user?.id;

  if (!userId) {
    res.status(401).json({ message: "No autorizado" });
    return;
  }

  try {
    const grupos = await prisma.equipmentGroup.findMany({
      where: { userId },
      orderBy: { name: "asc" },
    });

    res.status(200).json(grupos);
  } catch (error) {
    console.error("Error al obtener grupos:", error);
    res.status(500).json({ message: "Error al obtener grupos" });
  }
});

// POST crear grupo y asociarlo al usuario autenticado
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

// DELETE eliminar grupo solo si no tiene equipos asociados
router.delete("/:id", async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const userId = req.user?.id;

  if (!userId) {
    res.status(401).json({ message: "No autorizado" });
    return;
  }

  try {
    // Verificamos que el grupo pertenezca al usuario
    const grupo = await prisma.equipmentGroup.findUnique({
      where: { id },
    });

    if (!grupo || grupo.userId !== userId) {
      res.status(403).json({ message: "No tienes permiso para eliminar este grupo" });
      return;
    }

    // Verificamos si hay equipos asociados
    const equipos = await prisma.equipment.findMany({
      where: { groupId: id },
    });

    if (equipos.length > 0) {
      res.status(400).json({
        message: "No se puede eliminar el grupo porque tiene equipos asociados.",
      });
      return;
    }

    await prisma.equipmentGroup.delete({ where: { id } });
    res.status(204).send();
  } catch (error) {
    console.error("Error al eliminar grupo:", error);
    res.status(500).json({ message: "Error al eliminar grupo" });
  }
});

export default router;
