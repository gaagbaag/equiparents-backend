// src/auth/authService.js
import bcrypt from "bcryptjs";
import { prisma } from "../config/database.js";

/**
 * 🔍 Autentica a un usuario y valida su contraseña (si usaras login local)
 */
export const authenticateUser = async (email, password) => {
  const user = await prisma.user.findUnique({
    where: { email },
    include: { role: true },
  });

  if (!user) return null;

  const isMatch = await bcrypt.compare(password, user.password);
  return isMatch ? user : null;
};
/**
 * 🔄 Refresca el token JWT si es válido.
 * @param {String} token - Token expirado o a punto de expirar
 * @returns {String|null} Nuevo token o null si es inválido
 */
export const refreshAuthToken = (token) => {
  // Este método puede seguir siendo útil si implementas un flujo de refresh tokens manualmente,
  // pero no es obligatorio para `express-oauth2-jwt-bearer` ya que ese flujo está gestionado por OAuth2.
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return generateToken({
      id: decoded.userId,
      email: decoded.email,
      role: decoded.role,
    });
  } catch (error) {
    console.warn("⚠️ Intento de refresco con token inválido:", error.message);
    return null; // ❌ Token inválido o expirado
  }
};
