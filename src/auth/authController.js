// src/auth/authController.js
import { prisma } from "../config/database.js";
import { jwtDecode } from "jwt-decode";
import { createHistoryEntry } from "../utils/historyUtils.js";

/**
 * 📌 Crear usuario automáticamente si no existe tras login con Auth0
 */
export const createUserPostLogin = async (req, res) => {
  try {
    console.log("📨 POST /post-login recibido");

    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Token no válido o ausente" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwtDecode(token);

    const auth0Id = decoded.sub;
    const email =
      decoded["https://equiparents.api/email"] ||
      decoded.email ||
      `${auth0Id}@no-email.auth0`;
    const name = decoded.name || email;
    const picture = decoded.picture;
    const roles = decoded["https://equiparents.api/roles"];
    const roleName =
      Array.isArray(roles) && roles.length > 0 ? roles[0] : "parent";

    if (!auth0Id) {
      return res.status(400).json({ message: "sub no encontrado en el token" });
    }

    // ✅ Verificar si el usuario ya existe
    const existingUser = await prisma.user.findUnique({ where: { auth0Id } });
    if (existingUser) {
      console.log("👤 Usuario ya existe con auth0Id:", existingUser.email);
      return res
        .status(200)
        .json({ message: "Usuario ya registrado", data: existingUser });
    }

    // ✅ Verificar si el email ya está en uso
    const existingByEmail = await prisma.user.findUnique({ where: { email } });
    if (existingByEmail) {
      console.error("❌ Email ya usado por otro usuario:", email);
      return res
        .status(409)
        .json({ message: "Email ya registrado por otro usuario" });
    }

    // ✅ Buscar rol en la base de datos
    const role = await prisma.role.findUnique({ where: { name: roleName } });
    if (!role) {
      return res
        .status(500)
        .json({ message: `Rol '${roleName}' no encontrado en DB` });
    }

    // ✅ Crear nuevo usuario
    const newUser = await prisma.user.create({
      data: {
        auth0Id,
        email,
        name,
        picture,
        roleId: role.id,
        firstName: "",
        lastName: "",
      },
    });

    // ✅ Registrar historial si ya tiene cuenta parental (caso edge)
    if (newUser.parentalAccountId) {
      await createHistoryEntry({
        userId: newUser.id,
        parentalAccountId: newUser.parentalAccountId,
        summary: `Nuevo usuario registrado: ${email} (${roleName})`,
        type: "evento",
        category: "registro",
        ip: req.ip,
        userAgent: req.get("User-Agent"),
      });
    } else {
      console.log("⏭️ Historial omitido: usuario sin cuenta parental");
    }

    return res
      .status(201)
      .json({ message: "Usuario creado correctamente", data: newUser });
  } catch (error) {
    console.error("❌ Error en createUserPostLogin:", error);
    return res.status(500).json({ message: "Error al registrar usuario" });
  }
};

/**
 * 🛡️ Devuelve el rol del usuario autenticado por su `auth0Id`
 */
export const getUserRole = async (req, res) => {
  try {
    const { auth0Id } = req.body;

    if (!auth0Id) {
      return res.status(400).json({ message: "auth0Id es requerido" });
    }

    const user = await prisma.user.findUnique({
      where: { auth0Id },
      include: { role: true },
    });

    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    return res.status(200).json({ role: user.role.name });
  } catch (error) {
    console.error("❌ Error al obtener el rol:", error);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
};

/**
 * 🔒 Cerrar sesión eliminando la cookie `token`
 */
export const logout = (req, res) => {
  try {
    res.clearCookie("token");
    return res.status(200).json({ message: "Sesión cerrada con éxito" });
  } catch (error) {
    console.error("❌ Error al cerrar sesión:", error);
    return res.status(500).json({ error: "Error al cerrar sesión" });
  }
};
