

import express, { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import * as mime from "mime-types";
import authenticateJWT, { AuthenticatedRequest } from "../middleware/authenticateJWT";
import cloudinary from "../utils/cloudinary";
import fileUpload from "express-fileupload";

const router = express.Router();
const prisma = new PrismaClient();

/**
 * 3) Eliminar archivo
 * DELETE /api/mantenimientos/archivo/:archivoId
 */
router.delete(
  "/archivo/:archivoId",
  authenticateJWT,
  async (req: Request, res: Response): Promise<void> => {
    try {
      await prisma.file.delete({ where: { id: req.params.archivoId } });
      res.status(200).json({ message: "Archivo eliminado" });
    } catch (error) {
      console.error("Error al eliminar archivo:", error);
      res.status(500).json({ message: "Error al eliminar archivo" });
    }
  }
);

/**
 * 4) Listar mantenimientos de un equipo
 * GET /api/mantenimientos/by-equipo/:id
 */
router.get(
  "/by-equipo/:id",
  async (req: Request, res: Response): Promise<void> => {
    try {
      const mantenimientos = await prisma.maintenance.findMany({
        where: { equipmentId: req.params.id },
        orderBy: { date: "desc" },
      });
      res.status(200).json(mantenimientos);
    } catch (error) {
      console.error("Error al obtener mantenimientos por equipo:", error);
      res.status(500).json({ message: "Error interno" });
    }
  }
);

/**
 * 5) Listar todos los mantenimientos
 * GET /api/mantenimientos/
 */
router.get(
  "/",
  async (_req: Request, res: Response): Promise<void> => {
    try {
      const mantenimientos = await prisma.maintenance.findMany({
        include: {
          equipment: { include: { group: true } },
          files: true,
        },
        orderBy: { date: "desc" },
      });
      res.status(200).json(mantenimientos);
    } catch (error) {
      console.error("Error al obtener mantenimientos:", error);
      res.status(500).json({ message: "Error interno" });
    }
  }
);

/**
 * 6) Detalle de un mantenimiento (con URLs de archivos)
 * GET /api/mantenimientos/:id
 */
router.get(
  "/:id",
  async (req: Request, res: Response): Promise<void> => {
    try {
      const m = await prisma.maintenance.findUnique({
        where: { id: req.params.id },
        include: {
          equipment: { include: { group: true } },
          files: true,
        },
      });
      if (!m) {
        res.status(404).json({ message: "Mantenimiento no encontrado" });
        return;
      }
      const archivos = m.files.map((f) => ({
        id: f.id,
        filename: f.filename,
        url: `${req.protocol}://${req.get("host")}${f.url}`,
      }));
      res.status(200).json({ ...m, archivos });
    } catch (error) {
      console.error("Error al obtener mantenimiento:", error);
      res.status(500).json({ message: "Error interno" });
    }
  }
);

/**
 * 7) Crear nuevo mantenimiento
 * POST /api/mantenimientos/
 */
router.post(
  "/",
  authenticateJWT,
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ message: "No autorizado" });
        return;
      }
      const { name, date, equipmentId, status, notes } = req.body;
      const nuevo = await prisma.maintenance.create({
        data: {
          name,
          date: new Date(date),
          equipmentId,
          status,
          notes,
          userId: req.user.id,
        },
      });
      res.status(201).json(nuevo);
    } catch (error) {
      console.error("Error al crear mantenimiento:", error);
      res.status(500).json({ message: "Error interno" });
    }
  }
);

/**
 * 8) Actualizar un mantenimiento
 * PUT /api/mantenimientos/:id
 */
router.put(
  "/:id",
  authenticateJWT,
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { name, date, equipmentId, status, notes } = req.body;
      const actualizado = await prisma.maintenance.update({
        where: { id: req.params.id },
        data: {
          name,
          date: new Date(date),
          equipmentId,
          status,
          notes,
        },
      });
      res.status(200).json(actualizado);
    } catch (error) {
      console.error("Error al actualizar mantenimiento:", error);
      res.status(500).json({ message: "Error interno" });
    }
  }
);

/**
 * 9) Eliminar un mantenimiento
 * DELETE /api/mantenimientos/:id
 */
router.delete(
  "/:id",
  authenticateJWT,
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      await prisma.maintenance.delete({ where: { id: req.params.id } });
      res.status(204).end();
    } catch (error) {
      console.error("Error al eliminar mantenimiento:", error);
      res.status(500).json({ message: "Error interno" });
    }
  }
);

export default router;
