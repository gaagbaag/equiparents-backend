import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

/**
 * 📌 Genera un token de acceso (JWT)
 * @param {Object} payload - Datos a codificar en el token
 * @param {String} expiresIn - Tiempo de expiración (Ej: "7d")
 */
export const generateToken = (payload, expiresIn = "7d") => {
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn });
};

/**
 * 📌 Verifica un token JWT
 * @param {String} token - Token a verificar
 * @returns {Object|false} - Retorna los datos decodificados o `false` si es inválido
 */
export const verifyToken = (token) => {
  try {
    // Verificación adicional de audience e issuer
    const decoded = jwt.verify(token, process.env.JWT_SECRET, {
      audience: process.env.JWT_AUDIENCE,
      issuer: process.env.JWT_ISSUER,
    });
    return decoded; // Retorna los datos del token decodificado
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      console.error("❌ Token expirado:", error);
    } else if (error.name === "JsonWebTokenError") {
      console.error("❌ Token inválido:", error);
    } else {
      console.error("❌ Error desconocido al verificar el token:", error);
    }
    return false; // ❌ Token inválido o expirado
  }
};
