import express, { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import authenticateJWT from "../middleware/authenticateJWT";
import dayjs from "dayjs";

const router = express.Router();
const prisma = new PrismaClient();

// Todas las rutas están protegidas con JWT
router.use(authenticateJWT);

// Total de equipos
router.get("/total-equipos", async (_req: Request, res: Response) => {
  try {
    const total = await prisma.equipment.count();
    res.json({ total });
  } catch {
    res.status(500).json({ message: "Error interno al contar equipos" });
  }
});

// Total de mantenimientos
router.get("/total-mantenimientos", async (_req: Request, res: Response) => {
  try {
    const total = await prisma.maintenance.count();
    res.json({ total });
  } catch {
    res.status(500).json({ message: "Error interno al contar mantenimientos" });
  }
});

// Agrupados por estado
router.get("/estado-mantenimientos", async (_req: Request, res: Response) => {
  try {
    const grouped = await prisma.maintenance.groupBy({
      by: ["status"],
      _count: { status: true },
    });

    const result = grouped.map((g) => ({
      status: g.status,
      count: g._count.status,
    }));

    res.json(result);
  } catch {
    res.status(500).json({ message: "Error interno al agrupar mantenimientos" });
  }
});

// Mantenimientos por mes (últimos 6)
router.get("/mantenimientos-por-mes", async (_req: Request, res: Response) => {
  try {
    const ahora = dayjs();
    const inicio = ahora.subtract(5, "month").startOf("month");

    const mantenimientos = await prisma.maintenance.findMany({
      where: {
        date: {
          gte: inicio.toDate(),
          lte: ahora.endOf("month").toDate(),
        },
      },
      select: { date: true },
    });

    const resultado = Array.from({ length: 6 }).map((_, i) => {
      const fecha = inicio.add(i, "month");
      const mes = fecha.format("MMMM");
      const cantidad = mantenimientos.filter((m) =>
        dayjs(m.date).isSame(fecha, "month")
      ).length;
      return { mes, cantidad };
    });

    res.json(resultado);
  } catch {
    res.status(500).json({ message: "Error interno al agrupar por mes" });
  }
});

export default router;
