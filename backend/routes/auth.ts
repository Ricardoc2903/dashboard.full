// // routes/auth.ts
// import express, { Request, Response } from "express";
// import { PrismaClient } from "@prisma/client";
// import jwt from "jsonwebtoken";
// import bcrypt from "bcryptjs";
// import dotenv from "dotenv";
// import authenticateJWT, { AuthenticatedRequest } from "../middleware/authenticateJWT";

// dotenv.config();

// const router = express.Router();
// const prisma = new PrismaClient();
// const JWT_SECRET = process.env.JWT_SECRET || "clave-secreta";

// // REGISTRO
// router.post("/register", async (req: Request, res: Response): Promise<void> => {
//   try {
//     const { name, email, password } = req.body;

//     if (!name || !email || !password) {
//       res.status(400).json({ message: "Todos los campos son obligatorios." });
//       return;
//     }

//     const existingUser = await prisma.user.findUnique({ where: { email } });
//     if (existingUser) {
//       res.status(400).json({ message: "El usuario ya existe." });
//       return;
//     }

//     const hashedPassword = await bcrypt.hash(password, 10);

//     const newUser = await prisma.user.create({
//       data: {
//         name,
//         email,
//         password: hashedPassword,
//         role: "USER",
//       },
//     });

//     const token = jwt.sign(
//       { id: newUser.id, email: newUser.email, role: newUser.role },
//       JWT_SECRET,
//       { expiresIn: "1d" }
//     );

//     res.status(201).json({
//       token,
//       user: {
//         id: newUser.id,
//         name: newUser.name,
//         email: newUser.email,
//         role: newUser.role,
//       },
//     });
//   } catch (error) {
//     console.error("Error en el registro:", error);
//     res.status(500).json({ message: "Error al registrar el usuario." });
//   }
// });

// // LOGIN
// router.post("/login", async (req: Request, res: Response): Promise<void> => {
//   try {
//     const { email, password } = req.body;

//     if (!email || !password) {
//       res.status(400).json({ message: "Email y contraseña requeridos." });
//       return;
//     }

//     const user = await prisma.user.findUnique({ where: { email } });
//     if (!user || !user.password) {
//       res.status(400).json({ message: "Credenciales inválidas." });
//       return;
//     }

//     const isMatch = await bcrypt.compare(password, user.password);
//     if (!isMatch) {
//       res.status(400).json({ message: "Credenciales inválidas." });
//       return;
//     }

//     const token = jwt.sign(
//       { id: user.id, email: user.email, role: user.role },
//       JWT_SECRET,
//       { expiresIn: "1d" }
//     );

//     res.status(200).json({
//       token,
//       user: {
//         id: user.id,
//         name: user.name,
//         email: user.email,
//         role: user.role,
//       },
//     });
//   } catch (error) {
//     console.error("Error en el login:", error);
//     res.status(500).json({ message: "Error al iniciar sesión." });
//   }
// });

// export default router;


// backend/routes/auth.ts
import express, { Request, Response, Router } from "express";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";

dotenv.config();

const router: Router = express.Router();
const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || "clave-secreta";

// --------------------------------------------------
// RUTA: POST /api/auth/register
// --------------------------------------------------
router.post(
  "/register",
  async (req: Request, res: Response): Promise<void> => {
    try {
      console.log("[REGISTER] req.body =", req.body);
      const { name, email, password } = req.body;

      // 1) Validar campos
      if (!name || !email || !password) {
        let missingFields: string[] = [];
        if (!name) missingFields.push("name");
        if (!email) missingFields.push("email");
        if (!password) missingFields.push("password");

        res.status(400).json({
          message: "Todos los campos son obligatorios.",
          missingFields,
        });
        return;
      }

      // 2) Comprobar si existe el usuario
      const existingUser = await prisma.user.findUnique({
        where: { email },
      });
      if (existingUser) {
        res
          .status(400)
          .json({ message: "El usuario ya existe.", reason: "email_taken" });
        return;
      }

      // 3) Hashear contraseña y crear usuario
      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = await prisma.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          role: "USER",
        },
      });

      // 4) Generar token
      const token = jwt.sign(
        { id: newUser.id, email: newUser.email, role: newUser.role },
        JWT_SECRET,
        { expiresIn: "1d" }
      );

      // 5) Responder con token y datos de usuario
      res.status(201).json({
        token,
        user: {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
        },
      });
    } catch (err: any) {
      console.error("Error en el registro:", err);
      res.status(500).json({
        message: "Error al registrar el usuario.",
        details: err.message,
      });
    }
  }
);

// --------------------------------------------------
// RUTA: POST /api/auth/login
// --------------------------------------------------
router.post(
  "/login",
  async (req: Request, res: Response): Promise<void> => {
    try {
      console.log("[LOGIN] req.body =", req.body);
      const { email, password } = req.body;

      // 1) Validar campos
      if (!email || !password) {
        // Si falta email o password devolvemos un 400 genérico
        res
          .status(400)
          .json({ message: "Email y contraseña requeridos.", missingFields: ["email", "password"] });
        return;
      }

      // 2) Buscar usuario por email
      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) {
        // No existe este email
        res.status(400).json({ message: "Credenciales inválidas.", reason: "invalid_credentials" });
        return;
      }

      // 3) Comparar contraseña
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        // Contraseña incorrecta
        res.status(400).json({ message: "Credenciales inválidas.", reason: "invalid_credentials" });
        return;
      }

      // 4) Generar token
      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        JWT_SECRET,
        { expiresIn: "1d" }
      );

      // 5) Responder con token y datos de usuario
      res.status(200).json({
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      });
    } catch (err: any) {
      console.error("Error en el login:", err);
      res.status(500).json({
        message: "Error al iniciar sesión.",
        details: err.message,
      });
    }
  }
);

export default router;
