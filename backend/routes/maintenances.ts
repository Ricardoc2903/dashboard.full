// import express, { Request, Response } from "express";
// import { PrismaClient } from "@prisma/client";
// import authenticateJWT, { AuthenticatedRequest } from "../middleware/authenticateJWT";
// import multer from "multer";

// const router = express.Router();
// const prisma = new PrismaClient();

// // Configuración de multer en memoria
// const upload = multer({ storage: multer.memoryStorage() });



// /**
//  * POST /api/mantenimientos/:id/upload
//  * Recibe form-data (campo 'archivo') y guarda en BD
//  */
// router.post(
//   "/:id/upload",
//   authenticateJWT,
//   upload.single("archivo"),
//   async (req: AuthenticatedRequest, res: Response) => {
//     try {
//       if (!req.file) {
//         return res
//           .status(400)
//           .json({ message: "No se recibió ningún archivo" });
//       }
//       const nuevo = await prisma.file.create({
//         data: {
//           filename: req.file.originalname,
//           content: req.file.buffer, // Uint8Array
//           maintenanceId: req.params.id,
//         },
//       });
//       res.status(201).json(nuevo);
//     } catch (err) {
//       console.error("Error al subir archivo:", err);
//       res.status(500).json({ message: "Error al subir archivo" });
//     }
//   }
// );

// /**
//  * DELETE /api/mantenimientos/archivo/:archivoId
//  * Elimina el registro de la BD
//  */
// router.delete(
//   "/archivo/:archivoId",
//   authenticateJWT,
//   async (req: Request, res: Response) => {
//     try {
//       await prisma.file.delete({
//         where: { id: req.params.archivoId },
//       });
//       res.json({ message: "Archivo eliminado" });
//     } catch (err) {
//       console.error("Error al eliminar archivo:", err);
//       res.status(500).json({ message: "Error al eliminar archivo" });
//     }
//   }
// );

// /**
//  * GET /api/mantenimientos/archivo/:archivoId
//  * Sirve el buffer de la BD con el Content-Type adecuado
//  */
// router.get("/archivo/:archivoId", async (req: Request, res: Response) => {
//   try {
//     const archivo = await prisma.file.findUnique({
//       where: { id: req.params.archivoId },
//     });
//     if (!archivo) {
//       return res.status(404).json({ message: "Archivo no encontrado" });
//     }
//     const contentType =
//       mime.lookup(archivo.filename) || "application/octet-stream";
//     res.setHeader("Content-Type", contentType);
//     res.send(Buffer.from(archivo.content));
//   } catch (err) {
//     console.error("Error al servir archivo:", err);
//     res.status(500).json({ message: "Error interno" });
//   }
// });

// // Obtener todos los mantenimientos
// router.get("/", async (_req: Request, res: Response): Promise<void> => {
//   try {
//     const mantenimientos = await prisma.maintenance.findMany({
//       include: {
//         equipment: { include: { group: true } },
//       },
//       orderBy: { date: "desc" },
//     });
//     res.status(200).json(mantenimientos);
//   } catch (error) {
//     console.error("Error al obtener mantenimientos:", error);
//     res.status(500).json({ message: "Error interno del servidor" });
//   }
// });

// // Obtener mantenimiento por ID con archivos
// router.get("/:id", async (req: Request, res: Response): Promise<void> => {
//   try {
//     const { id } = req.params;

//     const mantenimiento = await prisma.maintenance.findUnique({
//       where: { id },
//       include: {
//         equipment: { include: { group: true } },
//         files: true, // ✅ Incluye los archivos aquí
//       },
//     });

//     if (!mantenimiento) {
//       res.status(404).json({ message: "Mantenimiento no encontrado" });
//       return;
//     }

//     // ✅ Mapea las URLs de los archivos para ser absolutas
//     const mantenimientoConArchivos = {
//       ...mantenimiento,
//       archivos: mantenimiento.files.map((archivo) => ({
//         id: archivo.id,
//         filename: archivo.filename,
//         url: `http://localhost:3000${archivo.url}`, // ✅ construimos URL completa
//       })),
//     };

//     res.status(200).json(mantenimientoConArchivos);
//   } catch (error) {
//     console.error("Error al obtener mantenimiento:", error);
//     res.status(500).json({ message: "Error interno del servidor" });
//   }
// });

// // Crear mantenimiento
// router.post(
//   "/",
//   async (req: AuthenticatedRequest, res: Response): Promise<void> => {
//     try {
//       if (!req.user) {
//         res.status(401).json({ message: "No autorizado" });
//         return;
//       }

//       const { name, date, equipmentId, status, notes } = req.body;

//       const nuevo = await prisma.maintenance.create({
//         data: {
//           name,
//           date: new Date(date),
//           equipmentId,
//           status,
//           notes,
//           userId: req.user.id,
//         },
//       });

//       res.status(201).json(nuevo);
//     } catch (error) {
//       console.error("Error al crear mantenimiento:", error);
//       res.status(500).json({ message: "Error interno del servidor" });
//     }
//   }
// );

// // ✅ Eliminar archivo usando solo el ID del archivo
// router.delete(
//   "/archivo/:archivoId",
//   async (req: AuthenticatedRequest, res: Response): Promise<void> => {
//     try {
//       const { archivoId } = req.params;

//       await prisma.file.delete({
//         where: { id: archivoId },
//       });

//       res.status(200).json({ message: "Archivo eliminado" });
//     } catch (error) {
//       console.error("Error al eliminar archivo:", error);
//       res.status(500).json({ message: "Error interno al eliminar archivo" });
//     }
//   }
// );

// // Actualizar mantenimiento
// router.put(
//   "/:id",
//   async (req: AuthenticatedRequest, res: Response): Promise<void> => {
//     try {
//       const { id } = req.params;
//       const { name, date, equipmentId, status, notes } = req.body;

//       const actualizado = await prisma.maintenance.update({
//         where: { id },
//         data: {
//           name,
//           date: new Date(date),
//           equipmentId,
//           status,
//           notes,
//         },
//       });

//       res.status(200).json(actualizado);
//     } catch (error) {
//       console.error("Error al actualizar mantenimiento:", error);
//       res.status(500).json({ message: "Error interno del servidor" });
//     }
//   }
// );

// // Eliminar mantenimiento
// router.delete(
//   "/:id",
//   async (req: AuthenticatedRequest, res: Response): Promise<void> => {
//     try {
//       const { id } = req.params;

//       await prisma.maintenance.delete({
//         where: { id },
//       });

//       res.status(204).send();
//     } catch (error) {
//       console.error("Error al eliminar mantenimiento:", error);
//       res.status(500).json({ message: "Error interno del servidor" });
//     }
//   }
// );

// // Obtener mantenimientos por ID de equipo
// router.get(
//   "/by-equipo/:id",
//   async (req: Request, res: Response): Promise<void> => {
//     const { id } = req.params;

//     try {
//       const mantenimientos = await prisma.maintenance.findMany({
//         where: { equipmentId: id },
//         orderBy: { date: "desc" },
//         include: {
//           equipment: true,
//         },
//       });

//       res.status(200).json(mantenimientos);
//     } catch (error) {
//       console.error("Error al obtener mantenimientos por equipo:", error);
//       res.status(500).json({ message: "Error interno del servidor" });
//     }
//   }
// );

// export default router;

// backend|outes/maintenances.ts

import express, { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import * as mime from "mime-types";
import authenticateJWT, { AuthenticatedRequest } from "../middleware/authenticateJWT";
import cloudinary from "../utils/cloudinary";
import fileUpload from "express-fileupload";

const router = express.Router();
const prisma = new PrismaClient();

// Middleware express-fileupload (en server.ts lo registras globalmente)
// app.use(fileUpload({ createParentPath: true, limits: { fileSize: 20 * 1024 * 1024 } }));

/**
 * POST /api/mantenimientos/:id/upload
 * Recibe el archivo en req.files.archivo, lo sube a Cloudinary y guarda en Prisma la URL resultante.
 */
// router.post(
//   "/:id/upload",
//   authenticateJWT,
//   async (req: AuthenticatedRequest, res: Response) => {
//     try {
//       // 1. Verificamos que exista req.files.archivo
//       if (!req.files || !req.files.archivo) {
//         return res.status(400).json({ message: "No se recibió ningún archivo" });
//       }

//       // 2. Obtenemos el buffer del archivo
//       const uploaded = Array.isArray(req.files.archivo)
//         ? req.files.archivo[0]
//         : req.files.archivo;
//       const buffer = (uploaded as any).data as Buffer;

//       // 3. Subimos a Cloudinary mediante un stream
//       const streamUpload = (buffer: Buffer) => {
//         return new Promise<cloudinary.UploadApiResponse>((resolve, reject) => {
//           const uploadStream = cloudinary.uploader.upload_stream(
//             {
//               folder: "mantenimientos",     // Carpeta (opcional) en tu cuenta de Cloudinary
//               resource_type: "image",
//             },
//             (error, result) => {
//               if (error) return reject(error);
//               if (!result) return reject(new Error("Sin respuesta de Cloudinary"));
//               resolve(result);
//             }
//           );
//           // Pipeamos el buffer al upload_stream:
//           uploadStream.end(buffer);
//         });
//       };

//       const result = await streamUpload(buffer);
//       // result.secure_url es la URL pública en Cloudinary

//       // 4. Guardamos en Prisma (modelo File) solo el nombre original y la URL
//       const nuevoFile = await prisma.file.create({
//         data: {
//           filename: uploaded.name,
//           url: result.secure_url,
//           maintenanceId: req.params.id,
//         },
//       });

//       return res.status(201).json(nuevoFile);
//     } catch (error) {
//       console.error("Error al subir a Cloudinary:", error);
//       return res.status(500).json({ message: "Error al subir archivo" });
//     }
//   }
// );

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
