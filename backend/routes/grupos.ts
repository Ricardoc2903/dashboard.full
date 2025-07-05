import express, { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const router = express.Router();
const prisma = new PrismaClient();

// GET todos los grupos (sin filtro por usuario)
router.get("/", async (_req: Request, res: Response): Promise<void> => {
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

// POST crear grupo (no se asocia a un usuario)
router.post("/", async (req: Request, res: Response): Promise<void> => {
  const { name } = req.body;

  if (!name || typeof name !== "string") {
    res.status(400).json({ message: "El nombre es requerido" });
    return;
  }

  try {
    const nuevoGrupo = await prisma.equipmentGroup.create({
      data: {
        name,
        user: undefined, // Se deja explícitamente sin usuario
      },
    });
    res.status(201).json(nuevoGrupo);
  } catch (error) {
    console.error("Error al crear grupo:", error);
    res.status(500).json({ message: "Error al crear grupo" });
  }
});

// DELETE eliminar grupo (solo si no tiene equipos asociados)
router.delete("/:id", async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
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
