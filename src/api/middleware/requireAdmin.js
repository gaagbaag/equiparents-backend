import { ROLES_CLAIM } from "../constants/authClaims.js";

export const requireAdmin = (req, res, next) => {
  const roles = req.user?.[ROLES_CLAIM] || [];

  if (!Array.isArray(roles)) {
    console.warn("❌ El claim de roles no es un arreglo válido");
    return res.status(403).json({ error: "Acceso denegado: roles inválidos" });
  }

  if (!roles.includes("admin")) {
    return res.status(403).json({ error: "Acceso solo para administradores" });
  }

  next();
};
