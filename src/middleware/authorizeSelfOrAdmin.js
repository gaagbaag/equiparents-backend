/**
 * Permite acceso si el usuario es admin o si accede a su propia cuenta
 */
export const authorizeSelfOrAdmin = (req, res, next) => {
  const user = req.auth;
  const requestedId = req.params.id;

  // Verificar que el usuario esté autenticado
  if (!user) {
    return res.status(401).json({ error: "No autenticado" });
  }

  const isAdmin = user.roles?.includes("admin");
  const isSelf = user.sub?.split("|")[1] === requestedId;

  if (!isAdmin && !isSelf) {
    return res.status(403).json({
      error: `Acceso denegado: no tienes permisos para acceder a este recurso. ${
        isAdmin ? "" : "No eres el propietario de la cuenta."
      }`,
    });
  }

  next();
};
