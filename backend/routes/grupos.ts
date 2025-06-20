// import express, { Request, Response } from "express";
// import { PrismaClient } from "@prisma/client";
// import { AuthenticatedRequest } from "../middleware/authenticateJWT";

// const router = express.Router();
// const prisma = new PrismaClient();

// // Obtener todos los grupos del usuario autenticado
// router.get("/", async (req: Request, res: Response): Promise<void> => {
//   const typedReq = req as AuthenticatedRequest;

//   try {
//     if (!typedReq.user) {
//       res.status(401).json({ message: "No autorizado" });
//       return;
//     }

//     const grupos = await prisma.equipmentGroup.findMany({
//       where: { userId: typedReq.user.id },
//       orderBy: { name: "asc" },
//     });

//     res.status(200).json(grupos);
//   } catch (error) {
//     console.error("Error al obtener grupos:", error);
//     res.status(500).json({ message: "Error al obtener grupos" });
//   }
// });

// // Crear nuevo grupo
// router.post("/", async (req: Request, res: Response): Promise<void> => {
//   const typedReq = req as AuthenticatedRequest;

//   try {
//     if (!typedReq.user) {
//       res.status(401).json({ message: "No autorizado" });
//       return;
//     }

//     const { name } = typedReq.body;
//     if (!name) {
//       res.status(400).json({ message: "El nombre es requerido" });
//       return;
//     }

//     const nuevoGrupo = await prisma.equipmentGroup.create({
//       data: {
//         name,
//         userId: typedReq.user.id,
//       },
//     });

//     res.status(201).json(nuevoGrupo);
//   } catch (error) {
//     console.error("Error al crear grupo:", error);
//     res.status(500).json({ message: "Error al crear grupo" });
//   }
// });

// export default router;

import express, { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import authenticateJWT, { AuthenticatedRequest } from "../middleware/authenticateJWT";

const router = express.Router();
const prisma = new PrismaClient();

/**
 * GET /api/grupos
 * – Aplica authenticateJWT para asegurar que req.user esté siempre definido.
 * – Devuelve únicamente los grupos que pertenecen al usuario autenticado.
 */
router.get(
  "/",
  authenticateJWT,
  async (req: Request, res: Response): Promise<void> => {
    const typedReq = req as AuthenticatedRequest;

    try {
      // authenticateJWT garantiza que req.user exista
      const grupos = await prisma.equipmentGroup.findMany({
        where: { userId: typedReq.user!.id },
        orderBy: { name: "asc" },
      });
      res.status(200).json(grupos);
    } catch (error) {
      console.error("Error al obtener grupos:", error);
      res.status(500).json({ message: "Error al obtener grupos" });
    }
  }
);

/**
 * POST /api/grupos
 * – Aplica authenticateJWT para que solo un usuario logueado pueda crear.
 * – Recibe { name } en el body y crea el grupo asignándolo a req.user.id.
 */
router.post(
  "/",
  authenticateJWT,
  async (req: Request, res: Response): Promise<void> => {
    const typedReq = req as AuthenticatedRequest;
    const { name } = typedReq.body;

    if (!name || typeof name !== "string") {
      res.status(400).json({ message: "El nombre es requerido" });
      return;
    }

    try {
      const nuevoGrupo = await prisma.equipmentGroup.create({
        data: {
          name,
          userId: typedReq.user!.id,
        },
      });
      res.status(201).json(nuevoGrupo);
    } catch (error) {
      console.error("Error al crear grupo:", error);
      res.status(500).json({ message: "Error al crear grupo" });
    }
  }
);

export default router;
