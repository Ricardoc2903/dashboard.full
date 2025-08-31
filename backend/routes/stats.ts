import express, { Request, Response } from "express";
import { MaintenanceStatus, PrismaClient } from "@prisma/client";
import authenticateJWT from "../middleware/authenticateJWT.js";
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

// ✅ 1) Top creadores de mantenimientos (usuarios)
router.get("/top-creators", async (req: Request, res: Response) => {
  try {
    const limit = Number(req.query.limit ?? 5);

    const grouped = await prisma.maintenance.groupBy({
      by: ["userId"],
      _count: { userId: true },
      orderBy: { _count: { userId: "desc" } },
      take: limit,
    });

    const userIds = grouped.map((g) => g.userId);
    const users = await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, name: true, email: true },
    });
    const userMap = new Map(users.map((u) => [u.id, u]));

    const data = grouped.map((g) => ({
      userId: g.userId,
      name: userMap.get(g.userId)?.name ?? "Desconocido",
      email: userMap.get(g.userId)?.email ?? "",
      count: g._count.userId,
    }));

    res.json(data);
  } catch (e) {
    res.status(500).json({ message: "Error en top-creators" });
  }
});

// ✅ 2) Tendencia de mantenimientos recientes (últimos N días, diario)
router.get("/maintenances-trend", async (req: Request, res: Response) => {
  try {
    const days = Math.min(Math.max(Number(req.query.days ?? 30), 1), 180); // 1..180
    const end = dayjs().endOf("day");
    const start = end.subtract(days - 1, "day").startOf("day");

    // Traemos solo en rango para eficiencia
    const list = await prisma.maintenance.findMany({
      where: { date: { gte: start.toDate(), lte: end.toDate() } },
      select: { date: true },
    });

    // Bucket diario
    const buckets: Record<string, number> = {};
    for (let i = 0; i < days; i++) {
      const d = start.add(i, "day").format("YYYY-MM-DD");
      buckets[d] = 0;
    }
    list.forEach((m) => {
      const d = dayjs(m.date).format("YYYY-MM-DD");
      if (d in buckets) buckets[d] += 1;
    });

    const series = Object.entries(buckets).map(([day, count]) => ({
      day,
      count,
    }));
    res.json(series);
  } catch (e) {
    res.status(500).json({ message: "Error en maintenances-trend" });
  }
});

// ✅ 3) Últimos mantenimientos (detalle)
router.get("/latest-maintenance", async (req: Request, res: Response) => {
  try {
    const limit = Number(req.query.limit ?? 5);
    const items = await prisma.maintenance.findMany({
      include: {
        user: { select: { id: true, name: true, email: true } },
        equipment: { select: { id: true, name: true } },
      },
      orderBy: { date: "desc" },
      take: limit,
    });
    res.json(items);
  } catch (e) {
    res.status(500).json({ message: "Error en latest-maintenance" });
  }
});

// ✅ 4) Últimos equipos (detalle)
router.get("/latest-equipos", async (req: Request, res: Response) => {
  try {
    const limit = Number(req.query.limit ?? 5);
    const items = await prisma.equipment.findMany({
      include: {
        user: { select: { id: true, name: true, email: true } },
        group: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: "desc" },
      take: limit,
    });
    res.json(items);
  } catch (e) {
    res.status(500).json({ message: "Error en latest-equipos" });
  }
});

export default router;
