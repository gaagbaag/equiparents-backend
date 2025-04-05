import { auth } from "express-oauth2-jwt-bearer";
import { prisma } from "../config/database.js";

// 🎯 Middleware base para validar el JWT desde Auth0
export const checkJwt = auth({
  audience: process.env.AUTH0_AUDIENCE,
  issuerBaseURL: process.env.AUTH0_ISSUER_BASE_URL,
  tokenSigningAlg: "RS256",
});

/**
 * 🔐 Middleware que autentica al usuario y adjunta su info a req.user
 */
export const authenticate = async (req, res, next) => {
  try {
    const auth0Id = req.auth?.payload?.sub;
    if (!auth0Id) {
      console.warn("❌ No se encontró el sub en req.auth");
      return res.status(401).json({ message: "No autenticado" });
    }

    console.log("🔎 Buscando usuario en DB con auth0Id:", auth0Id);

    const user = await prisma.user.findUnique({
      where: { auth0Id },
      include: { role: true },
    });

    if (!user) {
      console.warn("❌ Usuario no encontrado con auth0Id:", auth0Id);
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    req.user = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      parentalAccountId: user.parentalAccountId,
      role: user.role?.name,
    };

    next();
  } catch (err) {
    console.error("❌ Error en authenticate:", err);
    res.status(500).json({ message: "Error al autenticar usuario" });
  }
};

/**
 * 👮 Middleware genérico para requerir uno o más roles
 */
export const requireRole = (roles) => {
  const allowedRoles = Array.isArray(roles) ? roles : [roles];

  return (req, res, next) => {
    const userRole = req.user?.role;

    if (!userRole || !allowedRoles.includes(userRole)) {
      return res.status(403).json({
        message: "Acceso denegado: rol no autorizado",
      });
    }

    next();
  };
};

/**
 * 👮 Atajo para requerir rol admin
 */
export const requireAdmin = requireRole("admin");

/**
 * 👨‍👩‍👧‍👦 Middleware para requerir cuenta parental activa
 */
export const requireParentalAccount = (req, res, next) => {
  if (!req.user?.parentalAccountId) {
    return res
      .status(403)
      .json({ message: "No tienes cuenta parental asociada" });
  }

  next();
};
