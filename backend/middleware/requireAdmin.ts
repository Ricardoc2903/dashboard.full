// import { Response, NextFunction } from "express";
// import { AuthenticatedRequest } from "./authenticateJWT";

// export const requireAdmin = (
//   req: AuthenticatedRequest,
//   res: Response,
//   next: NextFunction
// ): void | Response => {
//   if (req.user?.role !== "ADMIN") {
//     return res
//       .status(403)
//       .json({ message: "Solo los administradores pueden realizar esta acción" });
//   }

//   next();
// };

// middleware/requireAdmin.ts
import { RequestHandler } from "express";
import { AuthenticatedRequest } from "./authenticateJWT";

export const requireAdmin: RequestHandler = (
  req: AuthenticatedRequest,
  res,
  next
): void => {
  if (req.user?.role !== "ADMIN") {
    // respond and corta la ejecución sin retornar el objeto Response
    res
      .status(403)
      .json({ message: "Solo los administradores pueden realizar esta acción" });
    return;
  }
  next();
};
