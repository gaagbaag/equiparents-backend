// src/api/auth/authController.js
import asyncHandler from "express-async-handler";
import { prisma } from "../config/database.js";
import { getRoleByName } from "../users/userService.js";
import { registerHistoryEvent } from "../history/historyService.js";

/**
 * 📌 Crear usuario automáticamente si no existe tras login con Auth0
 */
export const createUserPostLogin = asyncHandler(async (req, res) => {
  const auth0Id = req.auth?.payload?.sub;
  const email = req.auth?.payload?.["https://equiparents.api/email"];
  const name = req.auth?.payload?.["https://equiparents.api/name"] || email;

  console.log("🔥 createUserPostLogin ejecutado");
  console.log("🔐 auth0Id:", auth0Id);
  console.log("📨 email:", email);
  console.log("🧑‍💼 name:", name);

  if (!auth0Id || !email || !name) {
    console.warn("❌ Faltan datos en el token");
    return res.status(400).json({ message: "Datos de sesión incompletos" });
  }

  const existingUser = await prisma.user.findUnique({ where: { auth0Id } });

  if (existingUser) {
    console.log("ℹ️ Usuario ya existe en DB:", existingUser.id);
    return res.status(200).json({ message: "Usuario ya registrado" });
  }

  // Obtener el rol directamente desde el payload del JWT
  const userRoles = req.auth?.payload?.["https://equiparents.api/roles"] || [];
  let roleName = "parent"; // Valor por defecto

  if (userRoles.includes("admin")) {
    roleName = "admin";
  }

  // Obtener el rol correspondiente en la base de datos
  const role = await getRoleByName(roleName);
  if (!role) {
    console.error(`❌ Rol '${roleName}' no encontrado`);
    return res.status(500).json({ message: `Rol '${roleName}' no encontrado` });
  }

  const newUser = await prisma.user.create({
    data: {
      auth0Id,
      email,
      name,
      roleId: role.id,
    },
  });

  console.log("✅ Usuario creado con ID:", newUser.id);

  await registerHistoryEvent(newUser.id, "CREATED_USER_AUTOMATIC");

  return res.status(201).json({
    message: "Usuario creado correctamente",
    user: {
      id: newUser.id,
      email: newUser.email,
      auth0Id: newUser.auth0Id,
    },
  });
});

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
