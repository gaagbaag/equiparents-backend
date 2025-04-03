import { getSession } from "@auth0/nextjs-auth0"; // Usamos getSession para obtener la sesión activa
import { auth } from "express-oauth2-jwt-bearer";

/**
 * Middleware para verificar si el usuario está autenticado.
 * Este middleware es utilizado para rutas donde se necesita autenticar al usuario.
 */
export const checkJwt = async (req, res, next) => {
  try {
    const session = await getSession(req, res); // Obtenemos la sesión de Auth0
    if (!session || !session.accessToken) {
      return res.status(401).json({ error: "No autenticado" });
    }
    next(); // Si la sesión es válida, pasa al siguiente middleware
  } catch (error) {
    console.error("❌ Error al verificar sesión:", error);
    return res
      .status(500)
      .json({ error: "Error interno en la verificación de sesión" });
  }
};

/**
 * Middleware para verificar si el usuario tiene un rol específico (ej. admin).
 * Este middleware debe ser utilizado en rutas que requieren roles específicos.
 */
export const requireRole = (requiredRole) => {
  return async (req, res, next) => {
    try {
      const session = await getSession(req, res);

      if (!session || !session.user) {
        return res.status(401).json({ error: "No autenticado" });
      }

      const userRoles = session.user["https://equiparents.com/roles"]; // Obtener roles del claim

      if (!userRoles || !userRoles.includes(requiredRole)) {
        return res
          .status(403)
          .json({ error: `Acceso denegado: se requiere rol ${requiredRole}` });
      }

      next();
    } catch (error) {
      console.error("❌ Error en la verificación de roles:", error);
      res.status(500).json({ error: "Error interno al verificar el rol" });
    }
  };
};

/**
 * Middleware para verificar si el usuario es admin.
 * Utiliza el middleware `requireRole` con el rol 'admin'.
 */
export const requireAdmin = requireRole("admin");

/**
 * Middleware para manejar errores generales y capturar excepciones no manejadas.
 */
export const errorHandler = (err, req, res, next) => {
  console.error("Error:", err);
  res.status(500).json({ message: "Ocurrió un error en el servidor" });
};
