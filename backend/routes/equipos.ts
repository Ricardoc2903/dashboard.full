import express, { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { AuthenticatedRequest } from "../middleware/authenticateJWT";

const router = express.Router();
const prisma = new PrismaClient();

// Obtener todos los equipos (sin filtro por usuario)
router.get("/", async (_req: Request, res: Response): Promise<void> => {
  try {
    const equipos = await prisma.equipment.findMany({
      include: { group: true },
      orderBy: { createdAt: "desc" },
    });
    res.json(equipos);
  } catch (err) {
    console.error("Error al obtener equipos:", err);
    res.status(500).json({ message: "Error interno del servidor" });
  }
});

// Crear equipo (mantiene el usuario dueño)
router.post("/", async (req: Request, res: Response): Promise<void> => {
  const typedReq = req as AuthenticatedRequest;

  if (!typedReq.user) {
    res.status(401).json({ message: "No autorizado" });
    return;
  }

  const { name, type, location, acquiredAt, status, groupId } = typedReq.body;
  console.log("BODY recibido en backend:", typedReq.body);

  const allowedStatuses = ["ACTIVE", "MAINTENANCE", "OUT_OF_SERVICE"];
  if (!allowedStatuses.includes(status)) {
    console.log("Estado inválido recibido:", status);
    res.status(400).json({ message: "Estado no válido" });
    return;
  }

  try {
    const nuevo = await prisma.equipment.create({
      data: {
        name,
        type,
        location,
        acquiredAt: acquiredAt ? new Date(acquiredAt) : null,
        status,
        userId: typedReq.user.id,
        groupId: groupId || undefined,
      },
    });

    res.status(201).json(nuevo);
  } catch (err) {
    console.error("Error al crear equipo:", err);
    res.status(500).json({ message: "Error interno al crear equipo" });
  }
});

// Actualizar equipo
router.put("/:id", async (req: Request, res: Response): Promise<void> => {
  const typedReq = req as AuthenticatedRequest;
  if (!typedReq.user) {
    res.status(401).json({ message: "No autorizado" });
    return;
  }

  const { id } = req.params;
  const { name, type, location, acquiredAt, status, groupId } = typedReq.body;

  if (!name || !type || !location || !status) {
    res.status(400).json({ message: "Faltan campos obligatorios" });
    return;
  }

  try {
    const actualizado = await prisma.equipment.update({
      where: { id },
      data: {
        name,
        type,
        location,
        acquiredAt: acquiredAt ? new Date(acquiredAt) : null,
        status,
        groupId: groupId || undefined,
      },
    });

    res.json(actualizado);
  } catch (err) {
    console.error("Error al actualizar equipo:", err);
    res.status(500).json({ message: "Error interno al actualizar equipo" });
  }
});

// Eliminar equipo
router.delete("/:id", async (req: Request, res: Response): Promise<void> => {
  const typedReq = req as AuthenticatedRequest;
  if (!typedReq.user) {
    res.status(401).json({ message: "No autorizado" });
    return;
  }

  try {
    await prisma.equipment.delete({ where: { id: req.params.id } });
    res.status(204).send(); // ✅ Correcto
  } catch (err) {
    console.error("Error al eliminar equipo:", err);
    res.status(500).json({ message: "Error interno al eliminar equipo" });
  }
});


// Obtener equipo por ID con su grupo y mantenimientos (sin filtro de usuario)
router.get("/:id", async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    const equipo = await prisma.equipment.findUnique({
      where: { id },
      include: {
        group: true,
        mantenimientos: {
          orderBy: { date: "desc" },
        },
      },
    });

    if (!equipo) {
      res.status(404).json({ message: "Equipo no encontrado" });
      return;
    }

    res.json(equipo);
  } catch (err) {
    console.error("Error al obtener equipo:", err);
    res.status(500).json({ message: "Error interno al obtener equipo" });
  }
});

export default router;
